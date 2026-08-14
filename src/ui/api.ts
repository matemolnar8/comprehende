export type DiffLine = {
  kind: "ctx" | "add" | "del";
  oldNumber: number | null;
  newNumber: number | null;
  text: string;
};

export type LiveHunk = {
  path: string;
  oldPath?: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header: string;
  language: string;
  lines: DiffLine[];
};

export type ReviewMeta = {
  document: {
    version: 1;
    tickets?: { id: string; url?: string; title?: string }[];
  };
  resolved: {
    baseRef: string;
    headRef: string;
    range: string;
    baseSha: string;
    headSha: string;
  };
  coverage: {
    totalHunks: number;
    assignedHunks: number;
    unassignedCount: number;
    staleCount: number;
  };
  groups: {
    id: string;
    title: string;
    summary: string;
    suggestedOrder: number;
    hunkCount: number;
    staleCount: number;
    files: string[];
  }[];
  unassigned: { hunkCount: number; files: string[] };
  stale: { path: string; oldStart: number; newStart: number }[];
  files: {
    path: string;
    oldPath?: string;
    status: "added" | "deleted" | "modified" | "renamed";
    binary: boolean;
    hunkCount: number;
  }[];
  skipped: { path: string; reason: string }[];
  commits: { sha: string; shortSha: string; subject: string; author: string; date: string }[];
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const text = await response.text();
  if (!response.ok) {
    let message = text;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      if (parsed.error !== undefined) {
        message = parsed.error;
      }
    } catch {
      // keep raw text
    }
    throw new Error(message);
  }
  return JSON.parse(text) as T;
}

export function fetchReview(): Promise<ReviewMeta> {
  return getJson<ReviewMeta>("/api/review");
}

export function fetchHunks(group: string): Promise<{ hunks: LiveHunk[] }> {
  return getJson<{ hunks: LiveHunk[] }>(`/api/hunks?group=${encodeURIComponent(group)}`);
}

export function fetchFile(path: string, side: "old" | "new"): Promise<{ path: string; ref: string; content: string; language: string }> {
  return getJson(`/api/file?path=${encodeURIComponent(path)}&side=${side}`);
}

export function fetchBlame(
  path: string,
  side: "old" | "new",
): Promise<{ path: string; ref: string; lines: { sha: string; author: string; timestamp: number; line: number; text: string }[] }> {
  return getJson(`/api/blame?path=${encodeURIComponent(path)}&side=${side}`);
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}
