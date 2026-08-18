import { loadDocument } from "../cli/commands.ts";
import { blameFile } from "../git/blame.ts";
import { fileLanguage, filePatchFromGit, resolveSource, toHunkRef } from "../git/diff.ts";
import { GitError } from "../git/exec.ts";
import { listCommits } from "../git/log.ts";
import { mergeBase } from "../git/repo.ts";
import { showFile } from "../git/show.ts";
import { coverReview, type ReviewCoverage } from "../review/coverage.ts";
import type { DiffFile, LiveHunk, ReviewDocument } from "../schema/types.ts";
import { ApiError } from "./error.ts";
import type { ApiResource } from "./paths.ts";
import type { ApiBlame, ApiFile, ApiHunk, ApiHunks, ApiLayerFile, ApiReview, FileSide } from "./types.ts";

export type ReviewContext = {
  cwd: string;
  document: ReviewDocument;
  resolved: ApiReview["resolved"];
  files: DiffFile[];
  coverage: ReviewCoverage;
  mergeBaseSha: string;
  commits: ApiReview["commits"];
};

export async function openReview(cwd: string, dataPath: string): Promise<ReviewContext> {
  const document = await loadDocument(dataPath);
  const resolvedRefs = await resolveSource(cwd, document.source.baseRef, document.source.headRef);
  const { files, coverage } = await coverReview(cwd, document);
  const [mergeBaseSha, commits] = await Promise.all([
    mergeBase(cwd, document.source.baseRef, document.source.headRef),
    listCommits(cwd, document.source.baseRef, document.source.headRef),
  ]);
  return {
    cwd,
    document,
    resolved: {
      baseRef: document.source.baseRef,
      headRef: document.source.headRef,
      range: document.source.range ?? `${document.source.baseRef}...${document.source.headRef}`,
      baseSha: resolvedRefs.baseSha,
      headSha: resolvedRefs.headSha,
    },
    files,
    coverage,
    mergeBaseSha,
    commits,
  };
}

export function reviewPayload(ctx: ReviewContext): ApiReview {
  const { document, resolved, files, coverage, commits } = ctx;
  return {
    document,
    resolved,
    coverage: {
      totalHunks: coverage.totalHunks,
      assignedHunks: coverage.assignedHunks,
      unassignedCount: coverage.unassigned.length,
      staleCount: coverage.stale.length,
    },
    groups: coverage.groups
      .slice()
      .sort((a, b) => a.group.suggestedOrder - b.group.suggestedOrder || a.group.id.localeCompare(b.group.id))
      .map((group) => ({
        id: group.group.id,
        title: group.group.title,
        summary: group.group.summary,
        lookFor: group.group.lookFor ?? [],
        dependsOn: group.group.dependsOn ?? [],
        part: group.group.part,
        suggestedOrder: group.group.suggestedOrder,
        hunkCount: group.hunks.length,
        staleCount: group.stale.length,
        files: uniquePaths(group.hunks),
      })),
    unassigned: {
      hunkCount: coverage.unassigned.length,
      files: uniquePaths(coverage.unassigned),
    },
    stale: coverage.stale,
    files: files.map((file) => {
      const entry: ApiReview["files"][number] = {
        path: file.path,
        status: file.status,
        binary: file.binary,
        hunkCount: file.hunks.length,
      };
      if (file.oldPath !== undefined) {
        entry.oldPath = file.oldPath;
      }
      return entry;
    }),
    skipped: files.filter((file) => file.binary).map((file) => ({ path: file.path, reason: "binary" })),
    commits,
  };
}

export function hunksPayload(ctx: ReviewContext, groupId: string): ApiHunks {
  if (groupId === "") {
    throw new ApiError(400, "missing group");
  }
  if (groupId === "unassigned") {
    return serializeLayer(ctx.files, ctx.coverage.unassigned);
  }
  const group = ctx.coverage.groups.find((item) => item.group.id === groupId);
  if (group === undefined) {
    throw new ApiError(404, `unknown group "${groupId}"`);
  }
  return serializeLayer(ctx.files, group.hunks);
}

export async function filePayload(ctx: ReviewContext, path: string, side: FileSide): Promise<ApiFile> {
  const file = findFile(ctx.files, path);
  const lookup = side === "old" ? (file.oldPath ?? file.path) : file.path;
  assertSideExists(file, side);
  const ref = side === "old" ? ctx.mergeBaseSha : ctx.document.source.headRef;
  try {
    const content = await showFile(ctx.cwd, ref, lookup);
    return { path: lookup, ref, side, content, language: fileLanguage(lookup) };
  } catch (error) {
    throw new ApiError(404, error instanceof Error ? error.message : "file not found");
  }
}

export async function blamePayload(ctx: ReviewContext, path: string, side: FileSide): Promise<ApiBlame> {
  const file = findFile(ctx.files, path);
  const lookup = side === "old" ? (file.oldPath ?? file.path) : file.path;
  assertSideExists(file, side);
  const ref = side === "old" ? ctx.mergeBaseSha : ctx.document.source.headRef;
  try {
    const lines = await blameFile(ctx.cwd, ref, lookup);
    return { path: lookup, ref, side, lines };
  } catch (error) {
    throw new ApiError(404, error instanceof Error ? error.message : "blame not available");
  }
}

export async function renderResource(ctx: ReviewContext, resource: ApiResource): Promise<unknown> {
  switch (resource.kind) {
    case "review":
      return reviewPayload(ctx);
    case "hunks":
      return hunksPayload(ctx, resource.group);
    case "file":
      return filePayload(ctx, resource.path, resource.side);
    case "blame":
      return blamePayload(ctx, resource.path, resource.side);
  }
}

export function listResources(ctx: ReviewContext): ApiResource[] {
  const resources: ApiResource[] = [{ kind: "review" }, { kind: "hunks", group: "unassigned" }];
  for (const group of ctx.document.groups) {
    resources.push({ kind: "hunks", group: group.id });
  }
  for (const file of ctx.files) {
    for (const side of sidesFor(file)) {
      resources.push({ kind: "file", path: file.path, side });
      resources.push({ kind: "blame", path: file.path, side });
    }
  }
  return resources;
}

function sidesFor(file: DiffFile): FileSide[] {
  if (file.status === "added") {
    return ["new"];
  }
  if (file.status === "deleted") {
    return ["old"];
  }
  return ["old", "new"];
}

function serializeLayer(files: DiffFile[], hunks: LiveHunk[]): ApiHunks {
  const groups: { file: DiffFile; hunks: LiveHunk[] }[] = [];
  for (const hunk of hunks) {
    const existing = groups.find((group) => group.file.path === hunk.path);
    if (existing !== undefined) {
      existing.hunks.push(hunk);
      continue;
    }
    const file = files.find((item) => item.path === hunk.path);
    if (file === undefined) {
      continue;
    }
    groups.push({ file, hunks: [hunk] });
  }
  const serializedFiles = groups.map(({ file, hunks: fileHunks }) => {
    const next: ApiLayerFile = {
      path: file.path,
      patch: filePatchFromGit(file, fileHunks),
      hunks: fileHunks.map(serializeHunk),
    };
    if (file.oldPath !== undefined) {
      next.oldPath = file.oldPath;
    }
    return next;
  });
  return { hunks: hunks.map(serializeHunk), files: serializedFiles };
}

function serializeHunk(hunk: LiveHunk): ApiHunk {
  return {
    ...toHunkRef(hunk),
    header: hunk.header,
    language: fileLanguage(hunk.path),
    lines: hunk.lines,
  };
}

function findFile(files: DiffFile[], path: string): DiffFile {
  const file = files.find((item) => item.path === path || item.oldPath === path);
  if (file === undefined) {
    throw new ApiError(404, `path is not in the live diff: ${path}`);
  }
  return file;
}

function assertSideExists(file: DiffFile, side: FileSide): void {
  if (side === "old" && file.status === "added") {
    throw new ApiError(404, "file did not exist on the base side");
  }
  if (side === "new" && file.status === "deleted") {
    throw new ApiError(404, "file does not exist on the head side");
  }
}

function uniquePaths(hunks: LiveHunk[]): string[] {
  return [...new Set(hunks.map((hunk) => hunk.path))];
}

export function snapshotJson(body: unknown): string {
  return `${JSON.stringify(body)}\n`;
}

export function isUnavailableSnapshot(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 404 || error.status === 400;
  }
  return error instanceof GitError;
}
