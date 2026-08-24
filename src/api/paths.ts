import type { FileSide } from "./types.ts";

export type ApiResource =
  | { kind: "review" }
  | { kind: "agent-md"; target: "overview" }
  | { kind: "agent-md"; target: "group"; group: string }
  | { kind: "hunks"; group: string }
  | { kind: "file"; path: string; side: FileSide }
  | { kind: "blame"; path: string; side: FileSide }
  | { kind: "image"; path: string; side: FileSide }
  | { kind: "patch"; path: string };

export function apiHref(resource: ApiResource): string {
  switch (resource.kind) {
    case "review":
      return "api/review.json";
    case "agent-md":
      return agentMdRel(resource);
    case "hunks":
      return `api/hunks/${encodeURIComponent(resource.group)}.json`;
    case "file":
      return `api/files/${resource.side}/${encodeFilePath(resource.path)}.json`;
    case "blame":
      return `api/blame/${resource.side}/${encodeFilePath(resource.path)}.json`;
    case "image":
      return `api/images/${resource.side}/${encodeFilePath(resource.path)}`;
    case "patch":
      return `api/patches/${encodeFilePath(resource.path)}.json`;
  }
}

/** Decoded relative path under the site root. Static hosts map encoded request URLs onto this. */
export function apiFsRel(resource: ApiResource): string {
  switch (resource.kind) {
    case "review":
      return "api/review.json";
    case "agent-md":
      return agentMdRel(resource);
    case "hunks":
      return `api/hunks/${encodeURIComponent(resource.group)}.json`;
    case "file":
      return `api/files/${resource.side}/${resource.path}.json`;
    case "blame":
      return `api/blame/${resource.side}/${resource.path}.json`;
    case "image":
      return `api/images/${resource.side}/${resource.path}`;
    case "patch":
      return `api/patches/${resource.path}.json`;
  }
}

export function parseApiPath(pathname: string): ApiResource | undefined {
  const parts = pathname.split("/").filter((part) => part !== "").map(decodeSegment);
  if (parts[0] !== "api" || parts[1] === undefined) {
    return undefined;
  }
  if (parts[1] === "review.json" && parts.length === 2) {
    return { kind: "review" };
  }
  if (parts[1] === "agent") {
    if (parts.length === 3 && parts[2] === "overview.md") {
      return { kind: "agent-md", target: "overview" };
    }
    if (parts.length === 4 && parts[2] === "groups" && parts[3] !== undefined) {
      const group = mdStem(parts[3]);
      if (group === undefined) {
        return undefined;
      }
      return { kind: "agent-md", target: "group", group };
    }
    return undefined;
  }
  if (parts[1] === "hunks" && parts.length === 3 && parts[2] !== undefined) {
    const group = jsonStem(parts[2]);
    if (group === undefined) {
      return undefined;
    }
    return { kind: "hunks", group };
  }
  if (parts[1] === "images" && parts.length >= 4 && parts[2] !== undefined) {
    const side = parts[2];
    if (side !== "old" && side !== "new") {
      return undefined;
    }
    const path = parts.slice(3).join("/");
    if (!isRepoPath(path)) {
      return undefined;
    }
    return { kind: "image", path, side };
  }
  if (parts[1] === "patches" && parts.length >= 3) {
    const rest = parts.slice(2);
    const last = rest.at(-1);
    const stem = last === undefined ? undefined : jsonStem(last);
    if (stem === undefined) {
      return undefined;
    }
    rest[rest.length - 1] = stem;
    const path = rest.join("/");
    if (!isRepoPath(path)) {
      return undefined;
    }
    return { kind: "patch", path };
  }
  if ((parts[1] === "files" || parts[1] === "blame") && parts.length >= 4 && parts[2] !== undefined) {
    const side = parts[2];
    if (side !== "old" && side !== "new") {
      return undefined;
    }
    const rest = parts.slice(3);
    const last = rest.at(-1);
    const stem = last === undefined ? undefined : jsonStem(last);
    if (stem === undefined) {
      return undefined;
    }
    rest[rest.length - 1] = stem;
    const path = rest.join("/");
    if (!isRepoPath(path)) {
      return undefined;
    }
    return { kind: parts[1] === "files" ? "file" : "blame", path, side };
  }
  return undefined;
}

function encodeFilePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function agentMdRel(resource: Extract<ApiResource, { kind: "agent-md" }>): string {
  if (resource.target === "overview") {
    return "api/agent/overview.md";
  }
  return `api/agent/groups/${encodeURIComponent(resource.group)}.md`;
}

function jsonStem(file: string): string | undefined {
  if (!file.endsWith(".json")) {
    return undefined;
  }
  const stem = file.slice(0, -".json".length);
  return stem === "" ? undefined : stem;
}

function mdStem(file: string): string | undefined {
  if (!file.endsWith(".md")) {
    return undefined;
  }
  const stem = file.slice(0, -".md".length);
  return stem === "" ? undefined : stem;
}

function isRepoPath(path: string): boolean {
  return path !== "" && !path.startsWith("/") && !path.includes("\0") && !path.split("/").includes("..");
}
