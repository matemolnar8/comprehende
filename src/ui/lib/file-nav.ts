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
export function initialRailCollapsed(search: string, stored: boolean | null, narrowRail: boolean): boolean {
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

export function fileDirname(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "" : path.slice(0, slash);
}
