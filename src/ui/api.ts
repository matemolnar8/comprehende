import { apiHref, type ApiResource } from "../api/paths.ts";
import type { ApiBlame, ApiFile, ApiHunk, ApiHunks, ApiGroupFile, ApiReview, FileKind, FileSide } from "../api/types.ts";
import type { FileStatus } from "../schema/types.ts";

// UI LiveHunk is ApiHunk (adds language, omits patch), not schema LiveHunk (adds patch, omits language).
export type { ApiHunk as LiveHunk, ApiGroupFile, ApiReview as ReviewMeta, FileKind, FileStatus };
export { shortSha } from "../schema/types.ts";

export function resourceHref(resource: ApiResource): string {
  return new URL(apiHref(resource), new URL("./", document.baseURI)).href;
}

async function getJson<T>(resource: ApiResource): Promise<T> {
  const path = resourceHref(resource);
  const response = await fetch(path);
  const text = await response.text();
  if (!response.ok) {
    let message = text;
    try {
      const parsed: unknown = JSON.parse(text);
      if (isRecord(parsed) && typeof parsed.error === "string") {
        message = parsed.error;
      }
    } catch {
      // keep raw text
    }
    throw new Error(message);
  }
  const data: unknown = JSON.parse(text);
  return data as T;
}

export function fetchReview(): Promise<ApiReview> {
  return getJson<ApiReview>({ kind: "review" });
}

export function fetchHunks(group: string): Promise<ApiHunks> {
  return getJson<ApiHunks>({ kind: "hunks", group });
}

export function fetchPatch(path: string): Promise<ApiGroupFile> {
  return getJson<ApiGroupFile>({ kind: "patch", path });
}

export function fetchFile(path: string, side: FileSide): Promise<ApiFile> {
  return getJson<ApiFile>({ kind: "file", path, side });
}

export function fetchBlame(path: string, side: FileSide): Promise<ApiBlame> {
  return getJson<ApiBlame>({ kind: "blame", path, side });
}

export function groupIndex(groups: { id: string }[], id: string): number {
  return groups.findIndex((group) => group.id === id) + 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
