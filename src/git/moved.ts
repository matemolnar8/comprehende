import type { DiffFile, LiveHunk } from "../schema/types.ts";

/** Git `--color-moved=plain` ignores a block under 20 alphanumeric characters. */
const MOVED_MIN_ALNUM = 20;

type Slot = {
  path: string;
  line: number;
  text: string;
  hunk: LiveHunk;
  index: number;
};

/**
 * Mark add/delete lines that are the same block elsewhere in this diff.
 * Same rule as `git diff --color-moved=plain`: exact text, at least 20
 * alphanumeric characters in the block. Does not change patch text.
 */
export function markMovedLines(files: readonly DiffFile[]): void {
  const deleted = runs(files, "del");
  const added = runs(files, "add");
  const delAt = indexByText(deleted);
  const usedDel = new Set<Slot>();
  const usedAdd = new Set<Slot>();

  type Match = { dels: Slot[]; adds: Slot[]; score: number };
  const matches: Match[] = [];

  for (const addRun of added) {
    for (let ai = 0; ai < addRun.length; ai++) {
      const start = addRun[ai];
      if (start === undefined) {
        continue;
      }
      const candidates = delAt.get(start.text);
      if (candidates === undefined) {
        continue;
      }
      for (const candidate of candidates) {
        const delRun = candidate.run;
        const di = candidate.index;
        let len = 0;
        let score = 0;
        while (ai + len < addRun.length && di + len < delRun.length) {
          const add = addRun[ai + len];
          const del = delRun[di + len];
          if (add === undefined || del === undefined || add.text !== del.text) {
            break;
          }
          score += alnumCount(add.text);
          len += 1;
        }
        if (len > 0 && score >= MOVED_MIN_ALNUM) {
          matches.push({
            dels: delRun.slice(di, di + len),
            adds: addRun.slice(ai, ai + len),
            score,
          });
        }
      }
    }
  }

  matches.sort((a, b) => b.score - a.score || b.adds.length - a.adds.length);
  for (const match of matches) {
    if (match.dels.some((slot) => usedDel.has(slot)) || match.adds.some((slot) => usedAdd.has(slot))) {
      continue;
    }
    for (let i = 0; i < match.adds.length; i++) {
      const add = match.adds[i];
      const del = match.dels[i];
      if (add === undefined || del === undefined) {
        continue;
      }
      usedAdd.add(add);
      usedDel.add(del);
      const addLine = add.hunk.lines[add.index];
      const delLine = del.hunk.lines[del.index];
      if (addLine !== undefined) {
        addLine.moved = { path: del.path, line: del.line };
      }
      if (delLine !== undefined) {
        delLine.moved = { path: add.path, line: add.line };
      }
    }
  }
}

function runs(files: readonly DiffFile[], kind: "add" | "del"): Slot[][] {
  const out: Slot[][] = [];
  for (const file of files) {
    for (const hunk of file.hunks) {
      let current: Slot[] | undefined;
      for (let index = 0; index < hunk.lines.length; index++) {
        const line = hunk.lines[index];
        if (line === undefined || line.kind !== kind) {
          current = undefined;
          continue;
        }
        const number = kind === "add" ? line.newNumber : line.oldNumber;
        if (number === null) {
          current = undefined;
          continue;
        }
        const slot: Slot = {
          path: kind === "del" ? (file.oldPath ?? file.path) : file.path,
          line: number,
          text: line.text,
          hunk,
          index,
        };
        if (current === undefined) {
          current = [];
          out.push(current);
        }
        current.push(slot);
      }
    }
  }
  return out;
}

function indexByText(runs: Slot[][]): Map<string, { run: Slot[]; index: number }[]> {
  const out = new Map<string, { run: Slot[]; index: number }[]>();
  for (const run of runs) {
    for (let index = 0; index < run.length; index++) {
      const slot = run[index];
      if (slot === undefined) {
        continue;
      }
      const list = out.get(slot.text);
      const hit = { run, index };
      if (list === undefined) {
        out.set(slot.text, [hit]);
      } else {
        list.push(hit);
      }
    }
  }
  return out;
}

function alnumCount(text: string): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      count += 1;
    }
  }
  return count;
}
