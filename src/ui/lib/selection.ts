import type { ReviewMeta } from "../api.ts";

export type Selection = { kind: "overview" } | { kind: "group"; id: string } | { kind: "unassigned" };

export type SelectionStackSource = {
  groups: { id: string }[];
  unassigned: { hunkCount: number };
};

export function defaultSelection(source: SelectionStackSource): Selection {
  if (source.groups.length > 0) {
    return { kind: "overview" };
  }
  return { kind: "unassigned" };
}

export function selectionStorageKey(baseSha: string, headSha: string): string {
  return `comprehende.layer.${baseSha}.${headSha}`;
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
    if (parsed.kind === "unassigned") {
      return { kind: "unassigned" };
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
  if (stored.kind === "unassigned" && source.unassigned.hunkCount === 0 && source.groups.length > 0) {
    return defaultSelection(source);
  }
  return stored;
}

export function initialSelection(meta: ReviewMeta): Selection {
  return restoreSelection(meta, readStoredSelection(meta.resolved.baseSha, meta.resolved.headSha));
}

export function persistSelection(meta: ReviewMeta, selection: Selection): void {
  writeStoredSelection(meta.resolved.baseSha, meta.resolved.headSha, selection);
}

export function readStoredSelection(baseSha: string, headSha: string): Selection | null {
  try {
    return parseSelection(sessionStorage.getItem(selectionStorageKey(baseSha, headSha)));
  } catch {
    return null;
  }
}

export function writeStoredSelection(baseSha: string, headSha: string, selection: Selection): void {
  try {
    sessionStorage.setItem(selectionStorageKey(baseSha, headSha), serializeSelection(selection));
  } catch {
    // quota / private mode
  }
}

export function selectionStack(source: SelectionStackSource): Selection[] {
  const ids: Selection[] = [{ kind: "overview" }, ...source.groups.map((group) => ({ kind: "group" as const, id: group.id }))];
  if (source.unassigned.hunkCount > 0) {
    ids.push({ kind: "unassigned" });
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
  if (a.kind === "unassigned") {
    return b.kind === "unassigned";
  }
  return b.kind === "group" && b.id === a.id;
}
