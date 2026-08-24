import { isImagePath } from "../schema/image.ts";
import { isLockfilePath } from "../schema/lockfile.ts";
import type { DiffFile, FileStatus, HunkIndex, HunkRef, LiveHunk, ReviewSource } from "../schema/types.ts";
import { git } from "./exec.ts";
import { parseNameStatus, parseNumstat, type NameStatusEntry, type NumstatEntry } from "./name-status.ts";
import { assertSafePath, rangeLabel, resolveCommit } from "./repo.ts";

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
  const range = `${baseRef}...${headRef}`;
  const entries = parseNameStatus(
    await git(cwd, ["diff", "--find-renames", "--find-copies", "--name-status", "-z", "--end-of-options", range]),
  );
  const lockEntries = entries.filter((entry) => isLockfilePath(entry.path));
  const diffArgs = [
    "diff",
    "--find-renames",
    "--find-copies",
    "-U3",
    "--no-color",
    "--no-ext-diff",
    "--end-of-options",
    range,
  ];
  if (lockEntries.length > 0) {
    const excludes = [
      ...new Set(
        lockEntries.flatMap((entry) => {
          const paths = [`:(exclude)${entry.path}`];
          if (entry.oldPath !== undefined) {
            paths.push(`:(exclude)${entry.oldPath}`);
          }
          return paths;
        }),
      ),
    ];
    diffArgs.push("--", ".", ...excludes);
  }
  const files = classifyDiffFiles(parseUnifiedDiff(await git(cwd, diffArgs))).filter(
    (file) => !isLockfilePath(file.path),
  );
  if (lockEntries.length === 0) {
    return files;
  }
  const stats = parseNumstat(
    await git(cwd, [
      "diff",
      "--find-renames",
      "--find-copies",
      "--numstat",
      "-z",
      "--end-of-options",
      range,
      "--",
      ...lockEntries.map((entry) => entry.path),
    ]),
  );
  const stubs = lockEntries.map((entry) => lockfileDiffFile(entry, stats.get(entry.path)));
  return mergeDiffFiles(entries, files, stubs);
}

export async function readPathDiff(
  cwd: string,
  baseRef: string,
  headRef: string,
  path: string,
): Promise<DiffFile | undefined> {
  assertSafePath(path);
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
    "--",
    path,
  ]);
  const files = classifyDiffFiles(parseUnifiedDiff(stdout));
  return files.find((file) => file.path === path || file.oldPath === path);
}

export async function readHunkIndex(cwd: string, baseRef: string, headRef: string): Promise<HunkIndex> {
  const { source } = await resolveSource(cwd, baseRef, headRef);
  const files = await readDiff(cwd, baseRef, headRef);
  const hunks: HunkRef[] = [];
  const skipped: HunkIndex["skipped"] = [];
  for (const file of files) {
    if (file.image) {
      for (const hunk of file.hunks) {
        hunks.push(toHunkRef(hunk));
      }
      continue;
    }
    if (file.binary) {
      skipped.push({ path: file.path, reason: "binary" });
      continue;
    }
    if (isLockfilePath(file.path)) {
      skipped.push({ path: file.path, reason: "lockfile" });
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
  let offset = 0;
  while (offset < text.length) {
    const newline = text.indexOf("\n", offset);
    const lineEnd = newline === -1 ? text.length : newline;
    const line = text.slice(offset, lineEnd);
    const rawLine = text.slice(offset, newline === -1 ? text.length : newline + 1);
    if (line.startsWith("diff --git ")) {
      if (current !== undefined) {
        files.push(current.finish());
      }
      current = new FileBuilder(line, rawLine);
    } else if (current !== undefined) {
      current.consume(line, rawLine);
    }
    offset = newline === -1 ? text.length : newline + 1;
  }
  if (current !== undefined) {
    files.push(current.finish());
  }
  return files;
}

export function filePatchFromGit(file: DiffFile, hunks: LiveHunk[]): string {
  if (hunks.length === 0) {
    return "";
  }
  const selected = new Set(hunks);
  if (file.hunks.length === selected.size && file.hunks.every((hunk) => selected.has(hunk))) {
    return file.patch;
  }
  return `${file.headerPatch}${hunks.map((hunk) => hunk.patch).join("")}`;
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
  private hunkRaw = "";
  private headerPatch: string;
  private patch: string;
  private oldCursor = 0;
  private newCursor = 0;

  constructor(diffGitLine: string, rawLine: string) {
    const parsed = parseDiffGitLine(diffGitLine);
    this.oldPath = parsed.oldPath;
    this.path = parsed.newPath;
    this.headerPatch = rawLine;
    this.patch = rawLine;
  }

  consume(line: string, rawLine: string): void {
    this.patch += rawLine;
    const hunkMatch = HUNK_HEADER.exec(line);
    if (hunkMatch) {
      this.closeHunk();
      this.startHunk(line, hunkMatch, rawLine);
      return;
    }
    if (this.activeHunk !== undefined) {
      this.hunkRaw += rawLine;
      if (!line.startsWith("\\")) {
        this.pushHunkLine(line);
      }
      return;
    }
    this.headerPatch += rawLine;
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
      return;
    }
    if (line.startsWith("--- ")) {
      this.oldFile = stripDiffPath(line.slice(4));
      return;
    }
    if (line.startsWith("+++ ")) {
      this.newFile = stripDiffPath(line.slice(4));
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
    const file: DiffFile = {
      path,
      status,
      binary: this.binary,
      image: false,
      headerPatch: this.headerPatch,
      patch: this.patch,
      hunks,
    };
    if (oldPath !== undefined) {
      file.oldPath = oldPath;
    }
    return file;
  }

  private startHunk(header: string, match: RegExpExecArray, rawLine: string): void {
    const oldStart = Number(match[1]);
    const oldLines = match[2] === undefined ? 1 : Number(match[2]);
    const newStart = Number(match[3]);
    const newLines = match[4] === undefined ? 1 : Number(match[4]);
    this.oldCursor = oldStart;
    this.newCursor = newStart;
    this.hunkRaw = rawLine;
    this.activeHunk = {
      path: this.path,
      oldStart,
      oldLines,
      newStart,
      newLines,
      header,
      lines: [],
      patch: "",
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
      this.activeHunk.patch = this.hunkRaw;
      this.hunks.push(this.activeHunk);
      this.activeHunk = undefined;
      this.hunkRaw = "";
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
    if (file.binary && !file.image) {
      continue;
    }
    if (isLockfilePath(file.path)) {
      continue;
    }
    hunks.push(...file.hunks);
  }
  return hunks;
}

export function classifyDiffFiles(files: DiffFile[]): DiffFile[] {
  return files.map(classifyDiffFile);
}

function classifyDiffFile(file: DiffFile): DiffFile {
  if (!isImagePath(file.path) && (file.oldPath === undefined || !isImagePath(file.oldPath))) {
    return file;
  }
  return asImageFile(file);
}

function asImageFile(file: DiffFile): DiffFile {
  return { ...file, image: true, hunks: [imageLiveHunk(file.path, file.oldPath)] };
}

export function imageLiveHunk(path: string, oldPath?: string): LiveHunk {
  const hunk: LiveHunk = {
    path,
    oldStart: 0,
    oldLines: 0,
    newStart: 0,
    newLines: 0,
    header: "image",
    lines: [],
    patch: "",
  };
  if (oldPath !== undefined) {
    hunk.oldPath = oldPath;
  }
  return hunk;
}

function lockfileDiffFile(entry: NameStatusEntry, stat: NumstatEntry | undefined): DiffFile {
  const binary = stat === undefined || stat.added === null || stat.removed === null;
  const file: DiffFile = {
    path: entry.path,
    status: entry.status,
    binary,
    image: false,
    headerPatch: "",
    patch: "",
    hunks: [],
  };
  if (entry.oldPath !== undefined) {
    file.oldPath = entry.oldPath;
  }
  if (!binary && stat !== undefined && stat.added !== null && stat.removed !== null) {
    file.added = stat.added;
    file.removed = stat.removed;
  }
  return file;
}

function mergeDiffFiles(entries: NameStatusEntry[], files: DiffFile[], stubs: DiffFile[]): DiffFile[] {
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const stubsByPath = new Map(stubs.map((file) => [file.path, file]));
  const out: DiffFile[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const file = stubsByPath.get(entry.path) ?? filesByPath.get(entry.path);
    if (file === undefined || seen.has(file.path)) {
      continue;
    }
    seen.add(file.path);
    out.push(file);
  }
  for (const file of files) {
    if (!seen.has(file.path)) {
      out.push(file);
    }
  }
  return out;
}

export function fileLanguage(path: string): string {
  if (isImagePath(path)) {
    return "image";
  }
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
