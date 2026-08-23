import { loadDocument } from "../cli/commands.ts";
import { blameFile } from "../git/blame.ts";
import { readImageBlob } from "../git/blob.ts";
import { fileLanguage, filePatchFromGit, readPathDiff, toHunkRef } from "../git/diff.ts";
import { GitError } from "../git/exec.ts";
import { listCommits } from "../git/log.ts";
import { pinRange, type PinnedRange } from "../git/repo.ts";
import { showFile } from "../git/show.ts";
import { coverReview, type ReviewCoverage } from "../review/coverage.ts";
import { isLockfilePath } from "../schema/lockfile.ts";
import type { DiffFile, LiveHunk, ReviewDocument } from "../schema/types.ts";
import { ApiError } from "./error.ts";
import type { ApiResource } from "./paths.ts";
import type { ApiBlame, ApiFile, ApiHunk, ApiHunks, ApiGroupFile, ApiReview, FileSide } from "./types.ts";

export type { PinnedRange } from "../git/repo.ts";

export type JsonSnapshot = {
  encoding: "json";
  body: unknown;
};

export type BytesSnapshot = {
  encoding: "bytes";
  mediaType: string;
  body: Uint8Array;
};

export type Snapshot = JsonSnapshot | BytesSnapshot;

export type ReviewContext = {
  cwd: string;
  document: ReviewDocument;
  resolved: ApiReview["resolved"];
  files: DiffFile[];
  coverage: ReviewCoverage;
  mergeBaseSha: string;
  commits: ApiReview["commits"];
};

export async function pinReviewSource(cwd: string, dataPath: string): Promise<PinnedRange> {
  const document = await loadDocument(dataPath);
  return pinRange(cwd, document.source.baseRef, document.source.headRef);
}

export async function openReview(cwd: string, dataPath: string, pin?: PinnedRange): Promise<ReviewContext> {
  const document = await loadDocument(dataPath);
  const range = pin ?? (await pinRange(cwd, document.source.baseRef, document.source.headRef));
  const { files, coverage } = await coverReview(cwd, document, range);
  const commits = await listCommits(cwd, range.baseSha, range.headSha);
  return {
    cwd,
    document,
    resolved: {
      baseRef: document.source.baseRef,
      headRef: document.source.headRef,
      range: document.source.range ?? `${document.source.baseRef}...${document.source.headRef}`,
      baseSha: range.baseSha,
      headSha: range.headSha,
    },
    files,
    coverage,
    mergeBaseSha: range.mergeBaseSha,
    commits,
  };
}

export function reviewPayload(ctx: ReviewContext): ApiReview {
  const { document, resolved, files, coverage, commits } = ctx;
  const lockfiles = lockfileFiles(files);
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
        why: group.group.why,
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
    lockfiles: {
      fileCount: lockfiles.length,
      files: lockfiles.map((file) => file.path),
    },
    stale: coverage.stale,
    files: files.map((file) => {
      const entry: ApiReview["files"][number] = {
        path: file.path,
        status: file.status,
        binary: file.binary,
        image: file.image,
        hunkCount: file.hunks.length,
      };
      if (file.oldPath !== undefined) {
        entry.oldPath = file.oldPath;
      }
      return entry;
    }),
    skipped: files.filter((file) => file.binary && !file.image).map((file) => ({ path: file.path, reason: "binary" })),
    commits,
  };
}

export function hunksPayload(ctx: ReviewContext, groupId: string): ApiHunks {
  if (groupId === "") {
    throw new ApiError(400, "missing group");
  }
  if (groupId === "unassigned") {
    return serializeGroup(ctx.files, ctx.coverage.unassigned);
  }
  if (groupId === "lockfiles") {
    return serializeLockfiles(ctx.files);
  }
  const group = ctx.coverage.groups.find((item) => item.group.id === groupId);
  if (group === undefined) {
    throw new ApiError(404, `unknown group "${groupId}"`);
  }
  return serializeGroup(ctx.files, group.hunks);
}

export async function filePayload(ctx: ReviewContext, path: string, side: FileSide): Promise<ApiFile> {
  const file = findFile(ctx.files, path);
  const lookup = side === "old" ? (file.oldPath ?? file.path) : file.path;
  assertSideExists(file, side);
  const ref = side === "old" ? ctx.mergeBaseSha : ctx.resolved.headSha;
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
  const ref = side === "old" ? ctx.mergeBaseSha : ctx.resolved.headSha;
  try {
    const lines = await blameFile(ctx.cwd, ref, lookup);
    return { path: lookup, ref, side, lines };
  } catch (error) {
    throw new ApiError(404, error instanceof Error ? error.message : "blame not available");
  }
}

export async function imagePayload(ctx: ReviewContext, path: string, side: FileSide): Promise<BytesSnapshot> {
  const file = findFile(ctx.files, path);
  if (!file.image) {
    throw new ApiError(404, "path is not an image in the live diff");
  }
  const lookup = side === "old" ? (file.oldPath ?? file.path) : file.path;
  assertSideExists(file, side);
  const ref = side === "old" ? ctx.mergeBaseSha : ctx.resolved.headSha;
  try {
    const blob = await readImageBlob(ctx.cwd, ref, lookup);
    if (!blob.ok) {
      throw new ApiError(404, `Git LFS object sha256:${blob.oid} is not in this clone`);
    }
    return { encoding: "bytes", mediaType: blob.mediaType, body: blob.bytes };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(404, error instanceof Error ? error.message : "image not found");
  }
}

export async function renderResource(ctx: ReviewContext, resource: ApiResource): Promise<Snapshot> {
  switch (resource.kind) {
    case "review":
      return { encoding: "json", body: reviewPayload(ctx) };
    case "hunks":
      return { encoding: "json", body: hunksPayload(ctx, resource.group) };
    case "file":
      return { encoding: "json", body: await filePayload(ctx, resource.path, resource.side) };
    case "blame":
      return { encoding: "json", body: await blamePayload(ctx, resource.path, resource.side) };
    case "image":
      return imagePayload(ctx, resource.path, resource.side);
    case "patch":
      return { encoding: "json", body: await patchPayload(ctx, resource.path) };
  }
}

export function listResources(ctx: ReviewContext): ApiResource[] {
  const resources: ApiResource[] = [
    { kind: "review" },
    { kind: "hunks", group: "unassigned" },
    { kind: "hunks", group: "lockfiles" },
  ];
  for (const group of ctx.document.groups) {
    resources.push({ kind: "hunks", group: group.id });
  }
  for (const file of ctx.files) {
    if (file.image) {
      for (const side of sidesFor(file)) {
        resources.push({ kind: "image", path: file.path, side });
      }
      continue;
    }
    if (isLockfilePath(file.path) && !file.binary) {
      resources.push({ kind: "patch", path: file.path });
    }
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

function serializeGroup(files: DiffFile[], hunks: LiveHunk[]): ApiHunks {
  const filesByPath: { file: DiffFile; hunks: LiveHunk[] }[] = [];
  for (const hunk of hunks) {
    const existing = filesByPath.find((entry) => entry.file.path === hunk.path);
    if (existing !== undefined) {
      existing.hunks.push(hunk);
      continue;
    }
    const file = files.find((item) => item.path === hunk.path);
    if (file === undefined) {
      continue;
    }
    filesByPath.push({ file, hunks: [hunk] });
  }
  const serializedFiles = filesByPath.map(({ file, hunks: fileHunks }) => serializeGroupFile(file, fileHunks, true));
  return { hunks: hunks.map(serializeHunk), files: serializedFiles };
}

function serializeLockfiles(files: DiffFile[]): ApiHunks {
  const serializedFiles = lockfileFiles(files).map((file) => serializeGroupFile(file, [], true));
  return { hunks: [], files: serializedFiles };
}

function lockfileFiles(files: DiffFile[]): DiffFile[] {
  return files.filter((file) => isLockfilePath(file.path) && !file.binary && !file.image);
}

async function patchPayload(ctx: ReviewContext, path: string): Promise<ApiGroupFile> {
  const file = findFile(ctx.files, path);
  if (!isLockfilePath(file.path) || file.binary || file.image) {
    throw new ApiError(404, "path is not a deferred lockfile");
  }
  const live = await readPathDiff(ctx.cwd, ctx.resolved.baseSha, ctx.resolved.headSha, file.path);
  if (live === undefined) {
    throw new ApiError(404, `no live diff for ${path}`);
  }
  return serializeGroupFile(live, live.hunks, false);
}

function serializeGroupFile(file: DiffFile, fileHunks: LiveHunk[], deferLockfile: boolean): ApiGroupFile {
  const lockfile = isLockfilePath(file.path) && !file.binary && !file.image;
  const deferred = deferLockfile && lockfile;
  const next: ApiGroupFile = {
    path: file.path,
    kind: file.image ? "image" : lockfile ? "lockfile" : "text",
    status: file.status,
    patch: deferred ? "" : file.image ? file.headerPatch : filePatchFromGit(file, fileHunks),
    hunks: fileHunks.map(serializeHunk),
  };
  if (file.oldPath !== undefined) {
    next.oldPath = file.oldPath;
  }
  if (file.added !== undefined) {
    next.added = file.added;
  }
  if (file.removed !== undefined) {
    next.removed = file.removed;
  }
  return next;
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
