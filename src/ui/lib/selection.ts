import { REVIEW_BUCKETS, type ReviewBucket } from "../../api/types.ts";
import { padIndex } from "../../schema/types.ts";
import type { ReviewMeta } from "../api.ts";
import { groupOrderIndex, groupParts, isMixedReview, type Part, type PartGroup } from "./parts.ts";
import { readKey, writeKey } from "./storage.ts";

export type Selection = { kind: "overview" } | { kind: "group"; id: string } | { kind: ReviewBucket };

export type SelectionStackSource = {
  groups: PartGroup[];
  unassigned: { hunkCount: number };
  lockfiles?: { fileCount: number };
};

export type PartShiftSource = {
  groups: PartGroup[];
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

/** Overview, then groups in part / dependsOn order. Unassigned and lockfiles stay off this walk. */
export function groupWalk(source: SelectionStackSource): Selection[] {
  const parts = groupParts(source.groups);
  return [
    { kind: "overview" },
    ...parts.flatMap((part) => part.groupIds.map((id) => ({ kind: "group" as const, id }))),
  ];
}

export function selectionStack(source: SelectionStackSource): Selection[] {
  const ids = groupWalk(source);
  if (source.unassigned.hunkCount > 0) {
    ids.push({ kind: REVIEW_BUCKETS.unassigned });
  }
  if ((source.lockfiles?.fileCount ?? 0) > 0) {
    ids.push({ kind: REVIEW_BUCKETS.lockfiles });
  }
  return ids;
}

export function neighborSelection(
  source: SelectionStackSource | null,
  selection: Selection | null,
  delta: number,
): Selection | undefined {
  if (source === null || delta === 0) {
    return undefined;
  }
  const walk = partWalk(source, selection);
  const current = walk.findIndex((item) => sameSelection(item, selection));
  if (current >= 0) {
    return walk[current + delta];
  }
  if (delta < 0) {
    return walk[walk.length - 1];
  }
  return undefined;
}

/** Overview, then the current part in dependsOn order. From overview, that is the first part. */
function partWalk(source: SelectionStackSource, selection: Selection | null): Selection[] {
  const parts = groupParts(source.groups);
  const part = partForWalk(parts, selection);
  return [
    { kind: "overview" },
    ...(part?.groupIds ?? []).map((id) => ({ kind: "group" as const, id })),
  ];
}

function partForWalk(parts: readonly Part[], selection: Selection | null): Part | undefined {
  if (selection?.kind === "group") {
    return parts.find((item) => item.groupIds.includes(selection.id)) ?? parts[0];
  }
  if (selection?.kind === REVIEW_BUCKETS.unassigned || selection?.kind === REVIEW_BUCKETS.lockfiles) {
    return parts[parts.length - 1];
  }
  return parts[0];
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

export function shiftPartSelection(
  meta: PartShiftSource | null,
  selection: Selection | null,
  setSelection: (selection: Selection) => void,
  delta: number,
): void {
  if (meta === null || selection === null || selection.kind === REVIEW_BUCKETS.unassigned || selection.kind === REVIEW_BUCKETS.lockfiles) {
    return;
  }
  const parts = groupParts(meta.groups);
  if (!isMixedReview(parts)) {
    return;
  }
  const current =
    selection.kind === "group" ? parts.findIndex((part) => part.groupIds.includes(selection.id)) : delta > 0 ? -1 : parts.length;
  if (selection.kind === "group" && current < 0) {
    return;
  }
  const next = parts[(current + delta + parts.length) % parts.length];
  const id = next?.groupIds[0];
  if (id !== undefined && (selection.kind !== "group" || id !== selection.id)) {
    setSelection({ kind: "group", id });
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
    const parts = groupParts(meta.groups);
    const index = groupOrderIndex(parts, selection.id);
    const group = meta.groups.find((item) => item.id === selection.id);
    return {
      index: index > 0 ? padIndex(index) : undefined,
      title: group?.title ?? "Group",
    };
  }
  if (selection.kind === REVIEW_BUCKETS.unassigned) {
    return { title: "Unassigned" };
  }
  return { title: "Lockfiles" };
}
