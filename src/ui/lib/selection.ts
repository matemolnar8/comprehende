import type { ReviewMeta } from "../api.ts";

export type Selection = { kind: "overview" } | { kind: "group"; id: string } | { kind: "unassigned" };

export function defaultSelection(meta: ReviewMeta): Selection {
  if (meta.groups.length > 0) {
    return { kind: "overview" };
  }
  return { kind: "unassigned" };
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
  const ids: Selection[] = [{ kind: "overview" }, ...meta.groups.map((group) => ({ kind: "group" as const, id: group.id }))];
  if (meta.unassigned.hunkCount > 0) {
    ids.push({ kind: "unassigned" });
  }
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
