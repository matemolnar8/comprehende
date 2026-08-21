import type { FileStatus } from "../schema/types.ts";

export type NameStatusEntry = {
  status: FileStatus;
  path: string;
  oldPath?: string;
};

export type NumstatEntry = {
  path: string;
  oldPath?: string;
  added: number | null;
  removed: number | null;
};

export function parseNameStatus(stdout: string): NameStatusEntry[] {
  const parts = stdout.split("\0").filter((part) => part !== "");
  const entries: NameStatusEntry[] = [];
  let index = 0;
  while (index < parts.length) {
    const code = parts[index];
    index += 1;
    if (code === undefined) {
      break;
    }
    if (code.startsWith("R") || code.startsWith("C")) {
      const oldPath = parts[index];
      const path = parts[index + 1];
      index += 2;
      if (oldPath === undefined || path === undefined) {
        break;
      }
      entries.push({ status: "renamed", path, oldPath });
      continue;
    }
    const path = parts[index];
    index += 1;
    if (path === undefined) {
      break;
    }
    entries.push({ status: statusFrom(code), path });
  }
  return entries;
}

/** Git `--numstat -z`: `added\\tdeleted\\tpath\\0`, or `added\\tdeleted\\t\\0old\\0new\\0` for a rename. */
export function parseNumstat(stdout: string): Map<string, NumstatEntry> {
  const parts = stdout.split("\0");
  const out = new Map<string, NumstatEntry>();
  let index = 0;
  while (index < parts.length) {
    const field = parts[index];
    if (field === undefined || field === "") {
      index += 1;
      continue;
    }
    const match = /^(-|\d+)\t(-|\d+)\t(.*)$/.exec(field);
    if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
      break;
    }
    index += 1;
    const added = parseCount(match[1]);
    const removed = parseCount(match[2]);
    if (match[3] !== "") {
      out.set(match[3], { path: match[3], added, removed });
      continue;
    }
    const oldPath = parts[index];
    const path = parts[index + 1];
    index += 2;
    if (oldPath === undefined || path === undefined || oldPath === "" || path === "") {
      break;
    }
    out.set(path, { path, oldPath, added, removed });
  }
  return out;
}

function parseCount(value: string): number | null {
  return value === "-" ? null : Number(value);
}

function statusFrom(code: string): FileStatus {
  if (code.startsWith("A")) {
    return "added";
  }
  if (code.startsWith("D")) {
    return "deleted";
  }
  return "modified";
}
