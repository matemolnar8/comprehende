import { readKey, removeKey, writeKey } from "./storage.ts";

export function viewedStorageKey(baseSha: string, headSha: string): string {
  return `comprehende.viewed.${baseSha}.${headSha}`;
}

export function parseViewed(raw: string | null): Set<string> {
  if (raw === null || raw === "") {
    return new Set();
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((path) => typeof path !== "string")) {
      return new Set();
    }
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function serializeViewed(paths: Set<string>): string {
  return JSON.stringify([...paths].sort());
}

export function setPathViewed(paths: Set<string>, path: string, viewed: boolean): Set<string> {
  const next = new Set(paths);
  if (viewed) {
    next.add(path);
  } else {
    next.delete(path);
  }
  return next;
}

export function readViewed(key: string): Set<string> {
  forgetLocalViewed(key);
  return parseViewed(readKey(sessionStorage, key));
}

export function writeViewed(key: string, paths: Set<string>): void {
  forgetLocalViewed(key);
  writeKey(sessionStorage, key, serializeViewed(paths));
}

function forgetLocalViewed(key: string): void {
  removeKey(localStorage, key);
}
