const COMPACT_SUFFIX = /@(\d+)\+(\d+)$/;
const RENAME_MARK = " -> ";

/** Live git hunk. Identity is `(path, oldStart, newStart)`, plus `oldPath` when renamed. */
export type HunkRef = {
  path: string;
  oldPath?: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
};

/** Every live hunk of `path`. */
export type FileHunkRef = {
  path: string;
};

/** One hunk, written as `path@oldStart+newStart`. */
export type LocatedHunkRef = {
  path: string;
  oldPath?: string;
  oldStart: number;
  newStart: number;
};

/** Every live hunk under `dir`, written as a path ending in `/`. */
export type DirHunkRef = {
  dir: string;
};

export type ReviewHunkRef = FileHunkRef | LocatedHunkRef | DirHunkRef;

export type ParsedHunkString =
  | { kind: "file"; path: string }
  | { kind: "dir"; dir: string }
  | { kind: "hunk"; path: string; oldPath?: string; oldStart: number; newStart: number };

export function isLocatedHunkRef(ref: ReviewHunkRef): ref is LocatedHunkRef {
  return "oldStart" in ref;
}

export function isDirHunkRef(ref: ReviewHunkRef): ref is DirHunkRef {
  return "dir" in ref;
}

/** Whether `ref` covers hunks at `path`. A hunk ref covers its path and its old path. */
export function refCoversPath(ref: ReviewHunkRef, path: string): boolean {
  if (isDirHunkRef(ref)) {
    return path.startsWith(ref.dir);
  }
  return ref.path === path || (isLocatedHunkRef(ref) && ref.oldPath === path);
}

/**
 * The groups that hold `path`: a path or hunk ref in any group beats a directory ref, and the
 * deepest directory ref beats a shallower one.
 */
export function groupsHoldingPath<Group extends { hunkRefs: readonly ReviewHunkRef[] }>(
  groups: readonly Group[],
  path: string,
): Group[] {
  const named = groups.filter((group) =>
    group.hunkRefs.some((ref) => !isDirHunkRef(ref) && refCoversPath(ref, path)),
  );
  if (named.length > 0) {
    return named;
  }
  const dirs = groups.flatMap((group) =>
    group.hunkRefs.flatMap((ref) =>
      isDirHunkRef(ref) && refCoversPath(ref, path) ? [ref.dir] : [],
    ),
  );
  const deepest = dirs.reduce<string | undefined>(
    (best, dir) => (best === undefined || dir.length > best.length ? dir : best),
    undefined,
  );
  return deepest === undefined
    ? []
    : groups.filter((group) =>
        group.hunkRefs.some((ref) => isDirHunkRef(ref) && ref.dir === deepest),
      );
}

export function hunkKey(ref: Pick<HunkRef, "path" | "oldPath" | "oldStart" | "newStart">): string {
  const oldPath = ref.oldPath ?? "";
  return `${oldPath}\0${ref.path}\0${ref.oldStart}\0${ref.newStart}`;
}

export function formatHunkRef(ref: HunkRef): string {
  const rename = ref.oldPath !== undefined ? `${ref.oldPath} -> ` : "";
  return `${rename}${ref.path} @@ -${ref.oldStart},${ref.oldLines} +${ref.newStart},${ref.newLines} @@`;
}

/** A ref as review.json writes it, read back. Throws on a string the schema would reject. */
export function parseStoredHunkRef(value: string): ReviewHunkRef {
  const parsed = parseHunkRefString(value);
  if (parsed === undefined) {
    throw new Error(`invalid hunk ref string: ${value}`);
  }
  if (parsed.kind === "file") {
    return { path: parsed.path };
  }
  if (parsed.kind === "dir") {
    return { dir: parsed.dir };
  }
  if (parsed.oldPath === undefined) {
    return { path: parsed.path, oldStart: parsed.oldStart, newStart: parsed.newStart };
  }
  return {
    path: parsed.path,
    oldPath: parsed.oldPath,
    oldStart: parsed.oldStart,
    newStart: parsed.newStart,
  };
}

/** Path string, `dir/`, `path@oldStart+newStart`, or `old -> new@oldStart+newStart`. */
export function parseHunkRefString(value: string): ParsedHunkString | undefined {
  const text = value.trim();
  if (text === "") {
    return undefined;
  }
  const suffix = COMPACT_SUFFIX.exec(text);
  if (suffix === null) {
    if (!text.endsWith("/")) {
      return { kind: "file", path: text };
    }
    return text === "/" ? undefined : { kind: "dir", dir: text };
  }
  const oldStart = Number(suffix[1]);
  const newStart = Number(suffix[2]);
  if (!Number.isSafeInteger(oldStart) || !Number.isSafeInteger(newStart)) {
    return undefined;
  }
  const head = text.slice(0, suffix.index);
  const arrow = head.lastIndexOf(RENAME_MARK);
  if (arrow === -1) {
    if (head === "") {
      return undefined;
    }
    return { kind: "hunk", path: head, oldStart, newStart };
  }
  const oldPath = head.slice(0, arrow);
  const path = head.slice(arrow + RENAME_MARK.length);
  if (oldPath === "" || path === "") {
    return undefined;
  }
  return { kind: "hunk", path, oldPath, oldStart, newStart };
}

export function formatStoredHunkRef(ref: ReviewHunkRef): string {
  if (isDirHunkRef(ref)) {
    return ref.dir;
  }
  if (!isLocatedHunkRef(ref)) {
    return ref.path;
  }
  const rename = ref.oldPath !== undefined ? `${ref.oldPath} -> ` : "";
  return `${rename}${ref.path}@${ref.oldStart}+${ref.newStart}`;
}
