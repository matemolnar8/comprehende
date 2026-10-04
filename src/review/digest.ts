import { addedSymbols, lineDelta } from "../schema/hunk-meta.ts";
import { formatStoredHunkRef } from "../schema/identity.ts";
import type { DiffFile, FileStatus } from "../schema/types.ts";

export type DigestKind = "logic" | "test" | "docs" | "generated" | "rename" | "copy" | "move";

export type DigestHunk = {
  /** Same syntax as hunkRefs: a path, or path@oldStart+newStart. */
  ref: string;
  oldStart: number;
  newStart: number;
  added: number;
  removed: number;
  symbols: string[];
  /** Every added and removed line is a moved block (see markMovedLines). */
  moved: boolean;
};

export type DigestFile = {
  path: string;
  oldPath?: string;
  status: FileStatus;
  kind: DigestKind;
  added: number;
  removed: number;
  hunks: DigestHunk[];
  /** Test file whose source candidate lives next to it. Verify with show. */
  pairsWith?: string;
  /** First path of an identical-copy cluster. Trust it; do not read both. */
  mirrorOf?: string;
};

export type ChangeDigest = {
  files: DigestFile[];
  totalHunks: number;
};

/** One line per file. No patch text, so this stays small on large diffs. */
export function buildDigest(files: DiffFile[]): ChangeDigest {
  const digests = files
    .filter((file) => !file.binary || file.image)
    .map((file) => digestFile(file));
  markMirrors(digests, files);
  return { files: digests, totalHunks: digests.reduce((total, file) => total + file.hunks.length, 0) };
}

function digestFile(file: DiffFile): DigestFile {
  const hunks: DigestHunk[] = file.hunks.map((hunk) => {
    const delta = lineDelta(hunk.lines);
    const addedLines = hunk.lines.filter((line) => line.kind === "add").map((line) => line.text);
    const content = hunk.lines.filter((line) => line.kind !== "ctx");
    return {
      ref: formatStoredHunkRef(
        hunk.oldStart === 0 && hunk.newStart === 0
          ? { path: file.path }
          : { path: file.path, oldStart: hunk.oldStart, newStart: hunk.newStart },
      ),
      oldStart: hunk.oldStart,
      newStart: hunk.newStart,
      added: delta.added,
      removed: delta.removed,
      symbols: addedSymbols(addedLines),
      moved: content.length > 0 && content.every((line) => line.moved !== undefined),
    };
  });
  const added = hunks.reduce((total, hunk) => total + hunk.added, 0);
  const removed = hunks.reduce((total, hunk) => total + hunk.removed, 0);
  const digest: DigestFile = {
    path: file.path,
    status: file.status,
    kind: classifyKind(file, hunks),
    added,
    removed,
    hunks,
  };
  if (file.oldPath !== undefined) {
    digest.oldPath = file.oldPath;
  }
  const pair = pairTarget(file.path, digest.kind);
  if (pair !== undefined) {
    digest.pairsWith = pair;
  }
  return digest;
}

function classifyKind(file: DiffFile, hunks: DigestHunk[]): DigestKind {
  if (file.relocation?.kind === "rename" || file.status === "renamed") {
    return "rename";
  }
  if (file.relocation?.kind === "copy") {
    return "copy";
  }
  if (isTestPath(file.path)) {
    return "test";
  }
  if (isDocsPath(file.path)) {
    return "docs";
  }
  if (isGeneratedPath(file.path)) {
    return "generated";
  }
  if (hunks.length > 0 && hunks.every((hunk) => hunk.moved)) {
    return "move";
  }
  return "logic";
}

function isTestPath(path: string): boolean {
  if (/(^|\/)(__tests__|tests?)(\/|$)/.test(path)) {
    return true;
  }
  if (/\.(test|spec)\.[a-z]+$/i.test(path)) {
    return true;
  }
  const base = path.split("/").pop() ?? path;
  return /(^test_.*|.*_test\.[a-z]+$)/i.test(base);
}

function isDocsPath(path: string): boolean {
  return /\.(md|mdx|txt|rst)$/i.test(path);
}

function isGeneratedPath(path: string): boolean {
  return /(^|\/)(dist|build|coverage)\//.test(path) || /\.(min\.js|bundle\.js|snap)$/i.test(path) || /(^|\/)(__snapshots__|snapshots?)\//.test(path) || /\.gen\./.test(path);
}

/** Same directory, same stem without the test affix. A prefix: the extension may differ. */
function pairTarget(path: string, kind: DigestKind): string | undefined {
  if (kind !== "test") {
    return undefined;
  }
  const slash = path.lastIndexOf("/");
  const dir = slash === -1 ? "" : path.slice(0, slash + 1);
  const base = slash === -1 ? path : path.slice(slash + 1);
  const stem = base
    .replace(/\.(test|spec)(\.[a-z]+)?$/i, "")
    .replace(/^test_/, "")
    .replace(/_test(\.[a-z]+)?$/i, "");
  if (stem === base) {
    return undefined;
  }
  return `${dir}${stem}`;
}

/**
 * Files with identical added+removed line multisets are sync copies.
 * The first path wins; the rest point at it so the reader skips them.
 */
function markMirrors(digests: DigestFile[], files: DiffFile[]): void {
  const byKey = new Map<string, DigestFile[]>();
  for (let i = 0; i < digests.length; i += 1) {
    const digest = digests[i];
    const file = files[i];
    if (digest === undefined || file === undefined || digest.kind === "move") {
      continue;
    }
    const lines: string[] = [];
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.kind !== "ctx") {
          lines.push(`${line.kind}:${line.text}`);
        }
      }
    }
    if (lines.length === 0) {
      continue;
    }
    const key = lines.sort().join("\n");
    const cluster = byKey.get(key);
    if (cluster === undefined) {
      byKey.set(key, [digest]);
    } else {
      cluster.push(digest);
    }
  }
  for (const cluster of byKey.values()) {
    if (cluster.length < 2) {
      continue;
    }
    const first = cluster[0]?.path;
    if (first === undefined) {
      continue;
    }
    for (const digest of cluster.slice(1)) {
      digest.mirrorOf = first;
    }
  }
}

/** Covering refs for one digest file: a path when that covers every hunk, else located refs. */
export function digestHunkRefs(file: DigestFile): string[] {
  if (file.oldPath === undefined && file.hunks.length <= 1) {
    return [file.path];
  }
  return file.hunks.map((hunk) => {
    const at = `${hunk.oldStart}+${hunk.newStart}`;
    return file.oldPath === undefined ? `${file.path}@${at}` : `${file.oldPath} -> ${file.path}@${at}`;
  });
}

export function formatDigest(digest: ChangeDigest, range: string): string {  const files = digest.files.length;
  const header = `# Digest ${range} — ${files} file${files === 1 ? "" : "s"}, ${digest.totalHunks} hunk${digest.totalHunks === 1 ? "" : "s"}`;
  return [header, ...digest.files.map(formatFile)].join("\n");
}

function formatFile(file: DigestFile): string {
  const bits = [`- ${file.path}`, `${file.status} +${file.added}/-${file.removed}`, file.kind];
  if (file.oldPath !== undefined) {
    bits.push(`was ${file.oldPath}`);
  }
  if (file.hunks.length > 1) {
    bits.push(`hunks: ${file.hunks.map((hunk) => hunk.ref).join(" ")}`);
  }
  const symbols = [...new Set(file.hunks.flatMap((hunk) => hunk.symbols))];
  if (symbols.length > 0) {
    bits.push(`symbols: ${symbols.join(", ")}`);
  }
  if (file.pairsWith !== undefined) {
    bits.push(`pairs with ${file.pairsWith}.*`);
  }
  if (file.mirrorOf !== undefined) {
    bits.push(`identical copy of ${file.mirrorOf}`);
  }
  return bits.join(" · ");
}
