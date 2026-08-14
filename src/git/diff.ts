import type { DiffFile, FileStatus, HunkIndex, HunkRef, LiveHunk, ReviewSource } from "../schema/types.ts";
import { git } from "./exec.ts";
import { rangeLabel, resolveCommit } from "./repo.ts";

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

export async function resolveSource(
  cwd: string,
  baseRef: string,
  headRef: string,
): Promise<{ source: ReviewSource; baseSha: string; headSha: string }> {
  const baseSha = await resolveCommit(cwd, baseRef);
  const headSha = await resolveCommit(cwd, headRef);
  return {
    source: { baseRef, headRef, range: rangeLabel(baseRef, headRef) },
    baseSha,
    headSha,
  };
}

export async function readDiff(cwd: string, baseRef: string, headRef: string): Promise<DiffFile[]> {
  await resolveCommit(cwd, baseRef);
  await resolveCommit(cwd, headRef);
  const stdout = await git(cwd, [
    "diff",
    "--find-renames",
    "--find-copies",
    "-U3",
    "--no-color",
    "--no-ext-diff",
    "--end-of-options",
    `${baseRef}...${headRef}`,
  ]);
  return parseUnifiedDiff(stdout);
}

export async function readHunkIndex(cwd: string, baseRef: string, headRef: string): Promise<HunkIndex> {
  const { source } = await resolveSource(cwd, baseRef, headRef);
  const files = await readDiff(cwd, baseRef, headRef);
  const hunks: HunkRef[] = [];
  const skipped: HunkIndex["skipped"] = [];
  for (const file of files) {
    if (file.binary) {
      skipped.push({ path: file.path, reason: "binary" });
      continue;
    }
    for (const hunk of file.hunks) {
      hunks.push(toHunkRef(hunk));
    }
  }
  return { source, hunks, skipped };
}

export function toHunkRef(hunk: HunkRef): HunkRef {
  const ref: HunkRef = {
    path: hunk.path,
    oldStart: hunk.oldStart,
    oldLines: hunk.oldLines,
    newStart: hunk.newStart,
    newLines: hunk.newLines,
  };
  if (hunk.oldPath !== undefined) {
    ref.oldPath = hunk.oldPath;
  }
  return ref;
}

export function parseUnifiedDiff(text: string): DiffFile[] {
  const files: DiffFile[] = [];
  let current: FileBuilder | undefined;

  const flush = (): void => {
    if (current !== undefined) {
      files.push(current.finish());
      current = undefined;
    }
  };

  const lines = text.split(/\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === undefined) {
      continue;
    }
    if (line.startsWith("diff --git ")) {
      flush();
      current = new FileBuilder(line);
      continue;
    }
    if (current === undefined) {
      continue;
    }
    current.consume(line);
  }
  flush();
  return files;
}

class FileBuilder {
  path = "";
  oldPath: string | undefined;
  status: FileStatus = "modified";
  binary = false;
  hunks: LiveHunk[] = [];
  private oldFile: string | undefined;
  private newFile: string | undefined;
  private renameFrom: string | undefined;
  private renameTo: string | undefined;
  private activeHunk: LiveHunk | undefined;
  private oldCursor = 0;
  private newCursor = 0;

  constructor(diffGitLine: string) {
    const parsed = parseDiffGitLine(diffGitLine);
    this.oldPath = parsed.oldPath;
    this.path = parsed.newPath;
  }

  consume(line: string): void {
    if (line.startsWith("rename from ")) {
      this.renameFrom = line.slice("rename from ".length);
      return;
    }
    if (line.startsWith("copy from ")) {
      this.renameFrom = line.slice("copy from ".length);
      return;
    }
    if (line.startsWith("rename to ")) {
      this.renameTo = line.slice("rename to ".length);
      this.status = "renamed";
      return;
    }
    if (line.startsWith("copy to ")) {
      this.renameTo = line.slice("copy to ".length);
      this.status = "renamed";
      return;
    }
    if (line.startsWith("new file mode")) {
      this.status = "added";
      return;
    }
    if (line.startsWith("deleted file mode")) {
      this.status = "deleted";
      return;
    }
    if (line.startsWith("Binary files ") || line.startsWith("GIT binary patch")) {
      this.binary = true;
      this.activeHunk = undefined;
      return;
    }
    if (line.startsWith("--- ")) {
      this.oldFile = stripDiffPath(line.slice(4));
      return;
    }
    if (line.startsWith("+++ ")) {
      this.newFile = stripDiffPath(line.slice(4));
      return;
    }
    const hunkMatch = HUNK_HEADER.exec(line);
    if (hunkMatch) {
      this.startHunk(line, hunkMatch);
      return;
    }
    if (line.startsWith("\\")) {
      return;
    }
    if (this.activeHunk !== undefined) {
      this.pushHunkLine(line);
    }
  }

  finish(): DiffFile {
    this.closeHunk();
    const path = this.renameTo ?? this.newFile ?? this.path;
    const oldCandidate = this.renameFrom ?? this.oldFile;
    const oldPath = oldCandidate !== undefined && oldCandidate !== path ? oldCandidate : undefined;
    let status = this.status;
    if (status === "modified") {
      if (this.oldFile === undefined && this.newFile !== undefined) {
        status = "added";
      } else if (this.newFile === undefined && this.oldFile !== undefined) {
        status = "deleted";
      } else if (oldPath !== undefined) {
        status = "renamed";
      }
    }
    const hunks = this.binary
      ? []
      : this.hunks.map((hunk) => {
          const next: LiveHunk = { ...hunk, path };
          if (oldPath !== undefined) {
            next.oldPath = oldPath;
          }
          return next;
        });
    const file: DiffFile = { path, status, binary: this.binary, hunks };
    if (oldPath !== undefined) {
      file.oldPath = oldPath;
    }
    return file;
  }

  private startHunk(header: string, match: RegExpExecArray): void {
    this.closeHunk();
    const oldStart = Number(match[1]);
    const oldLines = match[2] === undefined ? 1 : Number(match[2]);
    const newStart = Number(match[3]);
    const newLines = match[4] === undefined ? 1 : Number(match[4]);
    this.oldCursor = oldStart;
    this.newCursor = newStart;
    this.activeHunk = {
      path: this.path,
      oldStart,
      oldLines,
      newStart,
      newLines,
      header,
      lines: [],
    };
  }

  private pushHunkLine(line: string): void {
    const hunk = this.activeHunk;
    if (hunk === undefined) {
      return;
    }
    const prefix = line[0];
    const text = prefix === "+" || prefix === "-" || prefix === " " ? line.slice(1) : line;
    if (prefix === "+") {
      hunk.lines.push({ kind: "add", oldNumber: null, newNumber: this.newCursor, text });
      this.newCursor += 1;
      return;
    }
    if (prefix === "-") {
      hunk.lines.push({ kind: "del", oldNumber: this.oldCursor, newNumber: null, text });
      this.oldCursor += 1;
      return;
    }
    hunk.lines.push({ kind: "ctx", oldNumber: this.oldCursor, newNumber: this.newCursor, text });
    this.oldCursor += 1;
    this.newCursor += 1;
  }

  private closeHunk(): void {
    if (this.activeHunk !== undefined) {
      this.hunks.push(this.activeHunk);
      this.activeHunk = undefined;
    }
  }
}

function parseDiffGitLine(line: string): { oldPath: string; newPath: string } {
  const rest = line.slice("diff --git ".length);
  const match = /^a\/(.*) b\/(.*)$/.exec(rest);
  if (!match || match[1] === undefined || match[2] === undefined) {
    return { oldPath: rest, newPath: rest };
  }
  if (match[1] === match[2]) {
    return { oldPath: match[1], newPath: match[2] };
  }
  const equal = /^a\/(.*) b\/\1$/.exec(rest);
  if (equal && equal[1] !== undefined) {
    return { oldPath: equal[1], newPath: equal[1] };
  }
  return { oldPath: match[1], newPath: match[2] };
}

function stripDiffPath(raw: string): string | undefined {
  const withoutTab = raw.split("\t")[0] ?? raw;
  if (withoutTab === "/dev/null") {
    return undefined;
  }
  if (withoutTab.startsWith("a/") || withoutTab.startsWith("b/")) {
    return withoutTab.slice(2);
  }
  return withoutTab;
}

export function flattenHunks(files: DiffFile[]): LiveHunk[] {
  const hunks: LiveHunk[] = [];
  for (const file of files) {
    if (file.binary) {
      continue;
    }
    hunks.push(...file.hunks);
  }
  return hunks;
}

export function fileLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "mts":
    case "cts":
      return "typescript";
    case "tsx":
      return "tsx";
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "jsx":
      return "jsx";
    case "json":
      return "json";
    case "css":
      return "css";
    case "html":
    case "htm":
      return "html";
    case "md":
    case "mdx":
      return "markdown";
    case "yml":
    case "yaml":
      return "yaml";
    case "py":
      return "python";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "sh":
    case "bash":
      return "bash";
    default:
      return "plaintext";
  }
}
