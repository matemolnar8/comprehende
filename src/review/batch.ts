import { lineDelta } from "../schema/hunk-meta.ts";
import { isLockfilePath } from "../schema/lockfile.ts";
import type { DiffFile, LiveHunk } from "../schema/types.ts";
import { buildDigest, type ChangeDigest, type DigestFile } from "./digest.ts";
import { numberedPatch } from "./show.ts";
import { guessSize, type SizeGuess } from "./size.ts";

/** Room under the smallest agent tool-result cap (Claude Code cuts Bash output at 30,000 chars). */
export const BATCH_CHARS = 25_000;

/** Above this many skipped files, batch 1 prints a count per reason instead of one line each. */
const MAX_SKIPPED_LINES = 20;

export type SkipReason =
  | { kind: "lockfile" | "binary" | "image" | "rename" | "copy" | "move" | "generated" }
  | { kind: "mirror"; of: string };

export type SkippedFile = { path: string; reason: SkipReason };

export type ReadFile = { file: DiffFile; digest: DigestFile };

type Piece = { path: string; text: string; changed: number };

export type Batch = { pieces: Piece[]; chars: number };

export type ReadingPlan = {
  digest: ChangeDigest;
  read: ReadFile[];
  skipped: SkippedFile[];
  /** At least one: batch 1 always exists, so it can carry the skipped list. */
  batches: [Batch, ...Batch[]];
  changedLines: number;
  size: SizeGuess;
};

/**
 * The files a reviewer reads, in digest order, packed into batches that fit one tool result.
 * Skips what reading cannot change: lockfiles, binaries, images, pure renames and copies, moved
 * blocks, generated output, and every file of a same-change cluster but the first.
 */
export function readingPlan(files: DiffFile[], budget = BATCH_CHARS): ReadingPlan {
  const digest = buildDigest(files);
  const digests = new Map(digest.files.map((item) => [item.path, item]));
  const read: ReadFile[] = [];
  const skipped: SkippedFile[] = [];
  for (const file of files) {
    const item = digests.get(file.path);
    const reason = skipReason(file, item);
    if (reason !== undefined) {
      skipped.push({ path: file.path, reason });
    } else if (item !== undefined) {
      read.push({ file, digest: item });
    }
  }
  const changedLines = read.reduce(
    (total, item) => total + item.digest.added + item.digest.removed,
    0,
  );
  const preamble = formatSkipped(skipped).join("\n").length;
  const [first = { pieces: [], chars: 0 }, ...rest] = packBatches(
    read.map((item) => item.file),
    budget,
    preamble,
  );
  return {
    digest,
    read,
    skipped,
    batches: [first, ...rest],
    changedLines,
    size: guessSize(changedLines),
  };
}

function skipReason(file: DiffFile, digest: DigestFile | undefined): SkipReason | undefined {
  if (isLockfilePath(file.path)) {
    return { kind: "lockfile" };
  }
  if (file.image) {
    return { kind: "image" };
  }
  if (file.binary || digest === undefined) {
    return { kind: "binary" };
  }
  if (digest.mirrorOf !== undefined) {
    return { kind: "mirror", of: digest.mirrorOf };
  }
  if ((digest.kind === "rename" || digest.kind === "copy") && digest.added + digest.removed === 0) {
    return { kind: digest.kind };
  }
  if (digest.kind === "move" || digest.kind === "generated") {
    return { kind: digest.kind };
  }
  return undefined;
}

/**
 * Greedy, in order. A file that fits the budget stays whole and opens a new batch when the
 * current one is full. A bigger file splits at hunk boundaries; one hunk bigger than the
 * budget fills a batch alone and prints whole.
 */
function packBatches(files: readonly DiffFile[], budget: number, reserved: number): Batch[] {
  const batches: Batch[] = [];
  let current: Batch = { pieces: [], chars: reserved };
  const fits = (chars: number): boolean => current.chars + chars <= budget;
  const close = (): void => {
    if (current.pieces.length > 0) {
      batches.push(current);
      current = { pieces: [], chars: 0 };
    }
  };
  const add = (piece: Piece): void => {
    current.pieces.push(piece);
    current.chars += piece.text.length + 1;
  };
  for (const file of files) {
    const whole = numberedPatch(file, file.hunks);
    if (whole.length <= budget || file.hunks.length < 2) {
      if (!fits(whole.length)) {
        close();
      }
      add({ path: file.path, text: whole, changed: changedLines(file.hunks) });
      continue;
    }
    const total = file.hunks.length;
    let start = 0;
    for (let end = 1; end <= total; end += 1) {
      if (fits(partText(file, start, end, total).length)) {
        continue;
      }
      if (end - 1 > start) {
        add(partPiece(file, start, end - 1, total));
        start = end - 1;
      }
      close();
    }
    add(partPiece(file, start, total, total));
  }
  close();
  return batches;
}

function partText(file: DiffFile, start: number, end: number, total: number): string {
  return `# ${file.path} · hunks ${start + 1}-${end} of ${total}\n${numberedPatch(file, file.hunks.slice(start, end))}`;
}

function partPiece(file: DiffFile, start: number, end: number, total: number): Piece {
  return {
    path: file.path,
    text: partText(file, start, end, total),
    changed: changedLines(file.hunks.slice(start, end)),
  };
}

function changedLines(hunks: readonly LiveHunk[]): number {
  return hunks.reduce((total, hunk) => {
    const delta = lineDelta(hunk.lines);
    return total + delta.added + delta.removed;
  }, 0);
}

/** Batch `n` (1-based) as `show --batch n` prints it. */
export function formatBatch(plan: ReadingPlan, n: number): string {
  const count = plan.batches.length;
  const batch = plan.batches[n - 1];
  if (!Number.isInteger(n) || batch === undefined) {
    throw new Error(
      `no batch ${n}: this range has ${count} batch${count === 1 ? "" : "es"} (${batchRange(count)})`,
    );
  }
  const files = new Set(batch.pieces.map((piece) => piece.path)).size;
  const changed = batch.pieces.reduce((total, piece) => total + piece.changed, 0);
  const lines = [
    `# Batch ${n} of ${count} · ${plural(files, "file")} · ${plural(changed, "changed line")}`,
  ];
  if (n === 1) {
    lines.push(...formatSkipped(plan.skipped));
  }
  for (const piece of batch.pieces) {
    lines.push(piece.text);
  }
  lines.push(n < count ? `# Next: show --batch ${n + 1}` : "# Last batch");
  return lines.join("\n");
}

function formatSkipped(skipped: readonly SkippedFile[]): string[] {
  if (skipped.length === 0) {
    return [];
  }
  const head = `# Skipped ${plural(skipped.length, "file")}; show --file <path> reads one`;
  if (skipped.length <= MAX_SKIPPED_LINES) {
    return [`${head}:`, ...skipped.map((item) => `#   ${item.path} · ${reasonLabel(item.reason)}`)];
  }
  const counts = new Map<string, number>();
  for (const item of skipped) {
    const label =
      item.reason.kind === "mirror" ? "same change as another file" : reasonLabel(item.reason);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const tally = [...counts].map(([label, total]) => `${total} ${label}`).join(", ");
  return [`${head}. The digest names them: ${tally}`];
}

function reasonLabel(reason: SkipReason): string {
  switch (reason.kind) {
    case "mirror":
      return `same change as ${reason.of}`;
    case "rename":
    case "copy":
      return `${reason.kind} +0/-0`;
    case "move":
      return "moved lines only";
    default:
      return reason.kind;
  }
}

/** The digest line that says how to read the change. */
export function formatReadLine(plan: ReadingPlan): string {
  return [
    `read: ${batchRange(plan.batches.length)}`,
    `${plural(plan.changedLines, "changed line")} in ${plural(plan.read.length, "file")}`,
    `${plural(plan.skipped.length, "file")} skipped`,
  ].join(" · ");
}

function batchRange(count: number): string {
  return `show --batch ${count === 1 ? "1" : `1..${count}`}`;
}

export function formatSizeLine(plan: ReadingPlan): string {
  return `size guess: ${plan.size.size} · ${plan.size.reason}`;
}

export function plural(n: number, word: string): string {
  return `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;
}
