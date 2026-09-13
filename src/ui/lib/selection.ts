import { REVIEW_BUCKETS, type ReviewBucket } from "../../api/types.ts";
import { padIndex } from "../../schema/types.ts";
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
  // Invariant: unknown or missing buckets fall back to the default selection.
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

/** Overview, then groups in document order. Unassigned and lockfiles stay off this walk. */
export function groupWalk(source: SelectionStackSource): Selection[] {
  return [{ kind: "overview" }, ...source.groups.map((group) => ({ kind: "group" as const, id: group.id }))];
}

export function neighborSelection(
  source: SelectionStackSource | null,
  selection: Selection | null,
  delta: number,
): Selection | undefined {
  if (source === null || delta === 0) {
    return undefined;
  }
  const walk = groupWalk(source);
  const current = walk.findIndex((item) => sameSelection(item, selection));
  if (current >= 0) {
    return walk[current + delta];
  }
  if (delta < 0) {
    return walk[walk.length - 1];
  }
  return undefined;
}

export function shiftSelection(
  source: SelectionStackSource | null,
  selection: Selection | null,
  setSelection: (selection: Selection) => void,
  delta: number,
): void {
  const next = neighborSelection(source, selection, delta);
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

export function selectionNavLabel(
  meta: Pick<ReviewMeta, "document" | "groups">,
  selection: Selection,
): string {
  const caption = selectionCaption(meta, selection);
  return caption.index !== undefined ? `${caption.index} ${caption.title}` : caption.title;
}

export function selectionCaption(
  meta: Pick<ReviewMeta, "document" | "groups">,
  selection: Selection | null,
): { index?: string; title: string } {
  if (selection === null || selection.kind === "overview") {
    return { title: "Overview" };
  }
  if (selection.kind === "group") {
    const index = meta.groups.findIndex((group) => group.id === selection.id);
    const group = index >= 0 ? meta.groups[index] : undefined;
    return {
      index: index >= 0 ? padIndex(index + 1) : undefined,
      title: group?.title ?? "Group",
    };
  }
  if (selection.kind === REVIEW_BUCKETS.unassigned) {
    return { title: "Unassigned" };
  }
  return { title: "Lockfiles" };
}
