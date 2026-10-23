import { addedSymbols, lineDelta } from "../schema/hunk-meta.ts";
import { formatStoredHunkRef } from "../schema/identity.ts";
import { isLockfilePath } from "../schema/lockfile.ts";
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
  /** First path of a cluster of files that received the same change. Trust it; read one. */
  mirrorOf?: string;
  /** Deleted file with the same name that git did not pair as a rename: a new version, not a move. */
  replaces?: string;
  /** The added file that replaces this deleted one. */
  replacedBy?: string;
};

/**
 * A directory whose changed files are all mechanical, at least half of them pure renames.
 * One digest line and one directory ref stand for the renames; other files keep their lines.
 */
export type DigestDir = {
  /** Ends in `/`, the same syntax as a directory hunk ref. */
  dir: string;
  renames: number;
  /** Shared move of every rename, when each kept its file name. */
  move?: { from: string; to: string };
};

export type ChangeDigest = {
  files: DigestFile[];
  dirs: DigestDir[];
  totalHunks: number;
};

const MIN_DIR_RENAMES = 5;

/** One line per file. No patch text, so this stays small on large diffs. */
export function buildDigest(files: DiffFile[]): ChangeDigest {
  const digests = files
    .filter((file) => !file.binary || file.image)
    .map((file) => digestFile(file));
  markMirrors(digests, files);
  markReplaces(digests);
  return {
    files: digests,
    dirs: mechanicalDirs(digests),
    totalHunks: digests.reduce((total, file) => total + file.hunks.length, 0),
  };
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
          : file.oldPath === undefined
            ? { path: file.path, oldStart: hunk.oldStart, newStart: hunk.newStart }
            : {
                path: file.path,
                oldPath: file.oldPath,
                oldStart: hunk.oldStart,
                newStart: hunk.newStart,
              },
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
  return (
    /(^|\/)(dist|build|coverage)\//.test(path) ||
    /\.(min\.js|bundle\.js|snap)$/i.test(path) ||
    /(^|\/)(__snapshots__|snapshots?)\//.test(path) ||
    /\.gen\./.test(path)
  );
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

/** An added file whose name matches exactly one deleted file, with no rename detected. */
function markReplaces(digests: DigestFile[]): void {
  const deleted = new Map<string, DigestFile[]>();
  for (const digest of digests) {
    if (digest.status === "deleted") {
      const name = baseName(digest.path);
      deleted.set(name, [...(deleted.get(name) ?? []), digest]);
    }
  }
  for (const digest of digests) {
    if (digest.status !== "added" || digest.oldPath !== undefined) {
      continue;
    }
    const candidates = deleted.get(baseName(digest.path)) ?? [];
    const [gone] = candidates;
    if (candidates.length === 1 && gone !== undefined) {
      digest.replaces = gone.path;
      gone.replacedBy = digest.path;
    }
  }
}

function baseName(path: string): string {
  return path.split("/").at(-1) ?? path;
}

/** Kinds the draft puts in its `mechanical` group. */
function isMechanicalKind(kind: DigestKind): boolean {
  return kind === "rename" || kind === "copy" || kind === "move" || kind === "generated";
}

/** Mechanical files go to the draft `mechanical` group; a replaced file and its replacement do not. */
export function isMechanicalFile(file: DigestFile): boolean {
  return (
    isMechanicalKind(file.kind) && file.replaces === undefined && file.replacedBy === undefined
  );
}

function isPureRename(file: DigestFile): boolean {
  return file.kind === "rename" && file.added === 0 && file.removed === 0;
}

function parentDirs(path: string): string[] {
  const parts = path.split("/").slice(0, -1);
  return parts.map((_, i) => `${parts.slice(0, i + 1).join("/")}/`);
}

function dirName(path: string): string {
  return path.slice(0, path.lastIndexOf("/") + 1);
}

/**
 * Shallowest directories whose changed files are all mechanical, at least half of them and at
 * least MIN_DIR_RENAMES pure renames, narrowed to the deepest directory with the same files.
 * Root-level files never collapse.
 */
function mechanicalDirs(files: DigestFile[]): DigestDir[] {
  const listed = files.filter(
    (file) =>
      !isLockfilePath(file.path) && file.replaces === undefined && file.replacedBy === undefined,
  );
  const total = new Map<string, number>();
  const mechanical = new Map<string, number>();
  const renames = new Map<string, number>();
  const bump = (counts: Map<string, number>, dir: string): void => {
    counts.set(dir, (counts.get(dir) ?? 0) + 1);
  };
  for (const file of listed) {
    for (const dir of parentDirs(file.path)) {
      bump(total, dir);
      if (isMechanicalFile(file) && file.mirrorOf === undefined) {
        bump(mechanical, dir);
      }
      if (isPureRename(file)) {
        bump(renames, dir);
      }
    }
  }
  const qualifies = (dir: string): boolean => {
    const count = total.get(dir) ?? 0;
    const pure = renames.get(dir) ?? 0;
    return mechanical.get(dir) === count && pure >= MIN_DIR_RENAMES && pure * 2 >= count;
  };
  const dirs: DigestDir[] = [];
  for (const top of total.keys()) {
    if (!qualifies(top) || parentDirs(top.slice(0, -1)).some(qualifies)) {
      continue;
    }
    const held = listed.filter((file) => file.path.startsWith(top));
    const dir =
      parentDirs(held[0]?.path ?? top)
        .filter((candidate) => held.every((file) => file.path.startsWith(candidate)))
        .at(-1) ?? top;
    const moves = new Set(
      held
        .filter(isPureRename)
        .map((file) =>
          file.oldPath !== undefined &&
          file.oldPath.split("/").at(-1) === file.path.split("/").at(-1)
            ? `${dirName(file.oldPath)}\0${dirName(file.path)}`
            : "",
        ),
    );
    const [move] = moves;
    const [from, to] =
      moves.size === 1 && move !== undefined && move !== "" ? move.split("\0") : [];
    const entry: DigestDir = { dir, renames: renames.get(top) ?? 0 };
    if (from !== undefined && to !== undefined) {
      entry.move = { from, to };
    }
    dirs.push(entry);
  }
  return dirs;
}

/** The collapsed directory whose ref covers `path`, if any. */
export function digestDirOf(digest: ChangeDigest, path: string): DigestDir | undefined {
  return digest.dirs.find((item) => path.startsWith(item.dir));
}

export function formatDigest(digest: ChangeDigest, range: string): string {
  const files = digest.files.length;
  const header = `# Digest ${range} — ${files} file${files === 1 ? "" : "s"}, ${digest.totalHunks} hunk${digest.totalHunks === 1 ? "" : "s"}`;
  const lines = [header];
  const printed = new Set<DigestDir>();
  for (const file of digest.files) {
    const dir = digestDirOf(digest, file.path);
    if (dir !== undefined && !printed.has(dir)) {
      printed.add(dir);
      lines.push(formatDir(dir));
    }
    if (dir === undefined || !isPureRename(file)) {
      lines.push(formatFile(file));
    }
  }
  return lines.join("\n");
}

function formatDir(dir: DigestDir): string {
  const bits = [`- ${dir.dir}`, `${dir.renames} files renamed +0/-0`, "rename"];
  if (dir.move !== undefined) {
    bits.push(`moved from ${dir.move.from} to ${dir.move.to}`);
  }
  return bits.join(" · ");
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
    bits.push(`same change as ${file.mirrorOf}`);
  }
  if (file.replaces !== undefined) {
    bits.push(`replaces ${file.replaces}, not a move`);
  }
  if (file.replacedBy !== undefined) {
    bits.push(`replaced by ${file.replacedBy}, not a move`);
  }
  return bits.join(" · ");
}
