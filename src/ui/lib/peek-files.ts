import { fileBasename, fileDirname } from "./file-nav.ts";

export const PEEK_LIMIT = 3;

export const PEEK_STYLES = ["stack", "line", "fold"] as const;

export type PeekStyle = (typeof PEEK_STYLES)[number];

export const PEEK_LABELS: Record<PeekStyle, string> = {
  stack: "Stack",
  line: "Line",
  fold: "Fold",
};

const PEEK_STORAGE_KEY = "comprehende:file-peek";

export function isPeekStyle(value: string | null): value is PeekStyle {
  return value === "stack" || value === "line" || value === "fold";
}

/** Show every path when the remainder would be 1. Otherwise cap at `limit`. */
export function peekFiles(paths: readonly string[], limit = PEEK_LIMIT): { shown: string[]; rest: number } {
  if (paths.length <= limit + 1) {
    return { shown: [...paths], rest: 0 };
  }
  return { shown: paths.slice(0, limit), rest: paths.length - limit };
}

export function commonDirname(paths: readonly string[]): string {
  if (paths.length === 0) {
    return "";
  }
  if (paths.length === 1) {
    return fileDirname(paths[0]!);
  }
  const parts = paths.map((path) => {
    const dir = fileDirname(path);
    return dir === "" ? [] : dir.split("/");
  });
  const first = parts[0];
  if (first === undefined || first.length === 0) {
    return "";
  }
  let depth = 0;
  while (depth < first.length && parts.every((item) => item[depth] === first[depth])) {
    depth += 1;
  }
  return first.slice(0, depth).join("/");
}

export function uniqueFileLabel(path: string, all: readonly string[]): string {
  const segments = path.split("/");
  for (let n = 1; n <= segments.length; n++) {
    const label = segments.slice(-n).join("/");
    const matches = all.filter((item) => item.split("/").slice(-n).join("/") === label);
    if (matches.length === 1) {
      return label;
    }
  }
  return path;
}

export function relativeToDir(path: string, dir: string): string {
  if (dir === "") {
    return path;
  }
  const prefix = `${dir}/`;
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

export function peekLabels(
  paths: readonly string[],
  style: PeekStyle,
): { dir: string; labels: string[]; rest: number } {
  const { shown, rest } = peekFiles(paths);
  if (style === "line" || style === "stack") {
    return { dir: "", labels: shown.map(fileBasename), rest };
  }
  const dir = commonDirname(paths);
  if (dir !== "") {
    return { dir, labels: shown.map((path) => relativeToDir(path, dir)), rest };
  }
  return { dir: "", labels: shown.map((path) => uniqueFileLabel(path, paths)), rest };
}

export function readPeekStyle(): PeekStyle {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("peek");
    if (isPeekStyle(fromUrl)) {
      return fromUrl;
    }
  } catch {
    // no window
  }
  try {
    const stored = localStorage.getItem(PEEK_STORAGE_KEY);
    if (isPeekStyle(stored)) {
      return stored;
    }
  } catch {
    // quota / private mode
  }
  return "stack";
}

export function writePeekStyle(style: PeekStyle): void {
  try {
    localStorage.setItem(PEEK_STORAGE_KEY, style);
  } catch {
    // ignore
  }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("peek", style);
    window.history.replaceState(null, "", url);
  } catch {
    // ignore
  }
}
