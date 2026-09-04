import { basename } from "../../schema/types.ts";
import { readKey, writeKey } from "./storage.ts";

const RAIL_COLLAPSED_KEY = "comprehende:rail-collapsed";

export function readStoredRailCollapsed(): boolean {
  return readKey(localStorage, RAIL_COLLAPSED_KEY) === "1";
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
