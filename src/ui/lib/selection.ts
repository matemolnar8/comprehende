import { REVIEW_BUCKETS, type ReviewBucket } from "../../api/types.ts";
import type { ReviewMeta } from "../api.ts";
import { readKey, writeKey } from "./storage.ts";

export type Selection = { kind: "overview" } | { kind: "group"; id: string } | { kind: ReviewBucket };

export type SelectionStackSource = {
  groups: { id: string }[];
  unassigned: { hunkCount: number };
  lockfiles?: { fileCount: number };
};

export function defaultSelection(source: SelectionStackSource): Selection {
  if (source.groups.length > 0) {
    return { kind: "overview" };
  }
  return { kind: REVIEW_BUCKETS.unassigned };
}

export function selectionStorageKey(baseSha: string, headSha: string): string {
  return `comprehende.group.${baseSha}.${headSha}`;
}

export function parseSelection(raw: string | null): Selection | null {
  if (raw === null || raw === "") {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !("kind" in parsed)) {
      return null;
    }
    if (parsed.kind === "overview") {
      return { kind: "overview" };
    }
    if (parsed.kind === REVIEW_BUCKETS.unassigned) {
      return { kind: REVIEW_BUCKETS.unassigned };
    }
    if (parsed.kind === REVIEW_BUCKETS.lockfiles) {
      return { kind: REVIEW_BUCKETS.lockfiles };
    }
    if (parsed.kind === "group" && "id" in parsed && typeof parsed.id === "string" && parsed.id !== "") {
      return { kind: "group", id: parsed.id };
    }
    return null;
  } catch {
    return null;
  }
}

export function serializeSelection(selection: Selection): string {
  return JSON.stringify(selection);
}

export function restoreSelection(source: SelectionStackSource, stored: Selection | null): Selection {
  if (stored === null) {
    return defaultSelection(source);
  }
  if (stored.kind === "group" && !source.groups.some((group) => group.id === stored.id)) {
    return defaultSelection(source);
  }
  if (stored.kind === REVIEW_BUCKETS.unassigned && source.unassigned.hunkCount === 0 && source.groups.length > 0) {
    return defaultSelection(source);
  }
  if (stored.kind === REVIEW_BUCKETS.lockfiles && (source.lockfiles?.fileCount ?? 0) === 0) {
    return defaultSelection(source);
  }
  return stored;
}

export function readStoredSelection(baseSha: string, headSha: string): Selection | null {
  return parseSelection(readKey(sessionStorage, selectionStorageKey(baseSha, headSha)));
}

export function writeStoredSelection(baseSha: string, headSha: string, selection: Selection): void {
  writeKey(sessionStorage, selectionStorageKey(baseSha, headSha), serializeSelection(selection));
}

export function selectionStack(source: SelectionStackSource): Selection[] {
  const ids: Selection[] = [{ kind: "overview" }, ...source.groups.map((group) => ({ kind: "group" as const, id: group.id }))];
  if (source.unassigned.hunkCount > 0) {
    ids.push({ kind: REVIEW_BUCKETS.unassigned });
  }
  if ((source.lockfiles?.fileCount ?? 0) > 0) {
    ids.push({ kind: REVIEW_BUCKETS.lockfiles });
  }
  return ids;
}

export function shiftSelection(
  meta: ReviewMeta | null,
  selection: Selection | null,
  setSelection: (selection: Selection) => void,
  delta: number,
): void {
  if (meta === null) {
    return;
  }
  const ids = selectionStack(meta);
  const current = ids.findIndex((item) => sameSelection(item, selection));
  const next = ids[(current + delta + ids.length) % ids.length];
  if (next !== undefined) {
    setSelection(next);
  }
}

export function sameSelection(a: Selection, b: Selection | null): boolean {
  if (b === null) {
    return false;
  }
  if (a.kind === "overview") {
    return b.kind === "overview";
  }
  if (a.kind === REVIEW_BUCKETS.unassigned) {
    return b.kind === REVIEW_BUCKETS.unassigned;
  }
  if (a.kind === REVIEW_BUCKETS.lockfiles) {
    return b.kind === REVIEW_BUCKETS.lockfiles;
  }
  return a.kind === "group" && b.kind === "group" && b.id === a.id;
}
