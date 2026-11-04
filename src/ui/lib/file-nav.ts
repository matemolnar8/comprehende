import { basename } from "../../schema/types.ts";
import { readKey, writeKey } from "./storage.ts";

const RAIL_COLLAPSED_KEY = "comprehende:rail-collapsed";

/** Below this width the file rail starts as the collapsed strip, unless the reader already chose. */
export const RAIL_NARROW_QUERY = "(max-width: 1099px)";

/** `null` when the reader has not chosen. `"1"` is collapsed, `"0"` is open. */
export function readStoredRailCollapsed(): boolean | null {
  const raw = readKey(localStorage, RAIL_COLLAPSED_KEY);
  if (raw === "1") {
    return true;
  }
  if (raw === "0") {
    return false;
  }
  return null;
}

/** Query wins, then a stored choice, then the narrow default. */
export function initialRailCollapsed(
  search: string,
  stored: boolean | null,
  narrowRail: boolean,
): boolean {
  const rail = new URLSearchParams(search).get("rail");
  if (rail === "collapsed") {
    return true;
  }
  if (rail === "open") {
    return false;
  }
  if (stored !== null) {
    return stored;
  }
  return narrowRail;
}

export function writeStoredRailCollapsed(collapsed: boolean): void {
  writeKey(localStorage, RAIL_COLLAPSED_KEY, collapsed ? "1" : "0");
}

/** File path helpers for display. */
export function fileBasename(path: string): string {
  return basename(path);
}

/** `undefined` for a root-level file. */
export function fileDirname(path: string): string | undefined {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? undefined : path.slice(0, slash);
}

/** The parent folder to show before a basename, such as `seed/`. Only a basename that two paths share gets one. */
export function repeatedNameFolders(paths: readonly string[]): (string | undefined)[] {
  const counts = new Map<string, number>();
  for (const path of paths) {
    const name = basename(path);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return paths.map((path) => {
    const dir = fileDirname(path);
    return (counts.get(basename(path)) ?? 0) < 2 || dir === undefined
      ? undefined
      : `${basename(dir)}/`;
  });
}

type Span = { top: number; bottom: number };

/**
 * How far to scroll a list so the row is fully in view, with the least movement.
 * Scrolling down stops on the first of `rowTops` that shows the row, so no row is cut at the top.
 */
export function scrollDeltaToShow(view: Span, row: Span, rowTops: readonly number[] = []): number {
  if (row.top < view.top) {
    return row.top - view.top;
  }
  if (row.bottom > view.bottom) {
    const least = row.bottom - view.bottom;
    const stop = rowTops.map((top) => top - view.top).find((delta) => delta >= least) ?? least;
    return Math.min(stop, row.top - view.top);
  }
  return 0;
}
