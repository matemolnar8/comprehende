import { apiHref, type ApiResource } from "../api/paths.ts";
import type { ApiBlame, ApiFile, ApiHunk, ApiHunks, ApiLayerFile, ApiReview } from "../api/types.ts";

export type { ApiHunk as LiveHunk, ApiLayerFile as LayerFile, ApiReview as ReviewMeta };

async function getJson<T>(resource: ApiResource): Promise<T> {
  const path = new URL(apiHref(resource), new URL("./", document.baseURI)).href;
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

export function fetchReview(): Promise<ApiReview> {
  return getJson<ApiReview>({ kind: "review" });
}

export function fetchHunks(group: string): Promise<ApiHunks> {
  return getJson<ApiHunks>({ kind: "hunks", group });
}

export function fetchFile(path: string, side: "old" | "new"): Promise<ApiFile> {
  return getJson<ApiFile>({ kind: "file", path, side });
}

export function fetchBlame(path: string, side: "old" | "new"): Promise<ApiBlame> {
  return getJson<ApiBlame>({ kind: "blame", path, side });
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function layerIndex(groups: { id: string }[], id: string): number {
  return groups.findIndex((group) => group.id === id) + 1;
}

export function padLayer(index: number): string {
  return String(index).padStart(2, "0");
}

export function sizeLabel(size: ApiReview["document"]["size"]): string {
  return size.replace("-", " ");
}
