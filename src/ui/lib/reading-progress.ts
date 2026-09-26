export type ReadingCounts = {
  total: number;
  viewed: number;
  left: number;
};

export type ReadingStatus = ReadingCounts & {
  /** Short mark for a row: "3 left" or "Viewed". */
  label: string;
  /** Standalone mark: "3 files left", "1 file left", or "All files viewed". */
  filesLabel: string;
};

export function readingCounts(paths: readonly string[], viewed: ReadonlySet<string>): ReadingCounts {
  const unique = new Set(paths);
  let viewedCount = 0;
  for (const path of unique) {
    if (viewed.has(path)) {
      viewedCount += 1;
    }
  }
  return { total: unique.size, viewed: viewedCount, left: unique.size - viewedCount };
}

/** Null when the list has no files. Progress is the reader's attention, not a verdict. */
export function readingStatus(paths: readonly string[], viewed: ReadonlySet<string>): ReadingStatus | null {
  const counts = readingCounts(paths, viewed);
  if (counts.total === 0) {
    return null;
  }
  const done = counts.left === 0;
  return {
    ...counts,
    label: done ? "Viewed" : `${counts.left} left`,
    filesLabel: done ? "All files viewed" : counts.left === 1 ? "1 file left" : `${counts.left} files left`,
  };
}

export function reviewReadingPaths(review: {
  groups: readonly { files: readonly string[] }[];
  unassigned: { files: readonly string[] };
  lockfiles: { files: readonly string[] };
}): string[] {
  const seen = new Set<string>();
  const paths: string[] = [];
  const add = (path: string) => {
    if (seen.has(path)) {
      return;
    }
    seen.add(path);
    paths.push(path);
  };
  for (const group of review.groups) {
    for (const path of group.files) {
      add(path);
    }
  }
  for (const path of review.unassigned.files) {
    add(path);
  }
  for (const path of review.lockfiles.files) {
    add(path);
  }
  return paths;
}

/** Binary paths git skipped. Null when nothing was skipped. */
export function skippedBinaryNote(skipped: readonly { path: string; reason: string }[]): string | null {
  const paths = skipped.flatMap((file) => (file.reason === "binary" ? [file.path] : []));
  if (paths.length === 0) {
    return null;
  }
  return paths.join(", ");
}
