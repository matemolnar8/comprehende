import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  filePatchFromGit,
  readDiff,
  readHunkIndex,
  readPathDiff,
  resolveSource,
} from "../git/diff.ts";
import { defaultBaseRef } from "../git/repo.ts";
import { coverReview, coverageErrors } from "../review/coverage.ts";
import { buildDigest, digestHunkRefs, formatDigest } from "../review/digest.ts";
import { loadDocument, resolveCliPath } from "../review/load.ts";
import { commentPinErrors, staleCommentPins } from "../review/pins.ts";
import { formatRefresh, refreshDocument } from "../review/refresh.ts";
import { skeletonDocument } from "../review/skeleton.ts";
import { writeDocument } from "../review/write.ts";
import { listNewSubjects } from "../git/log.ts";
import { parseHunkRefString } from "../schema/identity.ts";
import { sourceCitationErrors } from "../schema/source.ts";
import {
  shortSha,
  type HunkIndex,
  type ReviewDocument,
  type ReviewSource,
} from "../schema/types.ts";

export async function cmdIndex(
  cwd: string,
  base: string | undefined,
  head: string | undefined,
): Promise<HunkIndex> {
  const baseRef = base ?? (await defaultBaseRef(cwd));
  const headRef = head ?? "HEAD";
  return readHunkIndex(cwd, baseRef, headRef);
}

export function resolveOutPath(out: string | undefined, cwd: string): string {
  return resolveCliPath(out, cwd, "--out <dir>");
}

export async function cmdReview(
  cwd: string,
  dataPath: string,
  base: string | undefined,
  head: string | undefined,
): Promise<{ document: ReviewDocument; index: HunkIndex }> {
  const index = await cmdIndex(cwd, base, head);
  const skeleton = skeletonDocument(index);
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(skeleton, null, 2)}\n`);
  const document = await loadDocument(dataPath);
  return { document, index };
}

export async function cmdValidate(
  cwd: string,
  dataPath: string,
): Promise<{ document: ReviewDocument; warnings: string[]; assignedHunks: number }> {
  const document = await loadDocument(dataPath);
  const resolved = await resolveSource(cwd, document.source.baseRef, document.source.headRef);
  const { coverage } = await coverReview(cwd, document);
  const pins = await staleCommentPins(cwd, document, resolved);
  const errors = [
    ...coverageErrors(coverage),
    ...sourceCitationErrors(document),
    ...commentPinErrors(pins),
  ];
  if (errors.length > 0) {
    throw new Error(errors.join("\n\n"));
  }
  return { document, warnings: [], assignedHunks: coverage.assignedHunks };
}

/** One line per file. No patch text. Group from this; fetch patch with show. */
export async function cmdDigest(
  cwd: string,
  base: string | undefined,
  head: string | undefined,
): Promise<string> {
  const baseRef = base ?? (await defaultBaseRef(cwd));
  const headRef = head ?? "HEAD";
  const { source, baseSha, headSha } = await resolveSource(cwd, baseRef, headRef);
  const files = await readDiff(cwd, baseSha, headSha);
  const range = source.range ?? `${baseRef}...${headRef}`;
  return `${formatDigest(buildDigest(files), range)}\n`;
}

export type ShowRequest = { hunk?: string; file?: string };

/** Full patch for one file or one hunk. The detail behind a digest line. */
export async function cmdShow(
  cwd: string,
  base: string | undefined,
  head: string | undefined,
  request: ShowRequest,
): Promise<string> {
  const baseRef = base ?? (await defaultBaseRef(cwd));
  const headRef = head ?? "HEAD";
  const target = request.hunk ?? request.file;
  if (target === undefined) {
    throw new Error("show needs --hunk <ref> or --file <path>");
  }
  const parsed =
    request.hunk === undefined
      ? ({ kind: "file", path: target } as const)
      : parseHunkRefString(target);
  if (parsed === undefined) {
    throw new Error(`invalid hunk ref: ${target}`);
  }
  const file = await readPathDiff(cwd, baseRef, headRef, parsed.path);
  if (file === undefined) {
    throw new Error(`no diff for path: ${parsed.path}`);
  }
  if (parsed.kind === "file") {
    return file.patch;
  }
  const hunk = file.hunks.find(
    (item) => item.oldStart === parsed.oldStart && item.newStart === parsed.newStart,
  );
  if (hunk === undefined) {
    throw new Error(`no hunk matches: ${target}`);
  }
  return filePatchFromGit(file, [hunk]);
}

/**
 * Draft review.json from deterministic rules: identical-copy clusters,
 * mechanical files (rename, copy, move, generated), and one change group
 * for the rest. The skill accepts, splits, and writes the prose.
 */
export async function cmdPregroup(
  cwd: string,
  dataPath: string,
  base: string | undefined,
  head: string | undefined,
): Promise<{ document: ReviewDocument; index: HunkIndex }> {
  const baseRef = base ?? (await defaultBaseRef(cwd));
  const headRef = head ?? "HEAD";
  const { source, baseSha, headSha } = await resolveSource(cwd, baseRef, headRef);
  const files = await readDiff(cwd, baseSha, headSha);
  const { files: digests } = buildDigest(files);
  const mirrorRoots = new Set(
    digests
      .filter((digest) => digest.mirrorOf !== undefined)
      .map((digest) => digest.mirrorOf as string),
  );
  const mirrors = new Map<string, string[]>();
  const mechanical: string[] = [];
  const change: string[] = [];
  for (const digest of digests) {
    const refs = digestHunkRefs(digest);
    if (digest.mirrorOf !== undefined || mirrorRoots.has(digest.path)) {
      const root = digest.mirrorOf ?? digest.path;
      const cluster = mirrors.get(root) ?? [];
      cluster.push(...refs);
      mirrors.set(root, cluster);
      continue;
    }
    if (
      digest.kind === "rename" ||
      digest.kind === "copy" ||
      digest.kind === "move" ||
      digest.kind === "generated"
    ) {
      mechanical.push(...refs);
      continue;
    }
    change.push(...refs);
  }
  const index = await readHunkIndex(cwd, baseRef, headRef);
  const skeleton = skeletonDocument(index);
  const groups: {
    id: string;
    title: string;
    why: string;
    summary: string;
    suggestedOrder: number;
    hunkRefs: string[];
  }[] = [];
  if (change.length > 0 || (mirrors.size === 0 && mechanical.length === 0)) {
    groups.push({
      id: "change",
      title: "Change",
      why: "Draft: the change minus copies and mechanical files. Split by concern.",
      summary: "Fill this group.",
      suggestedOrder: 0,
      hunkRefs: change,
    });
  }
  let order = 1;
  for (const [root, paths] of mirrors) {
    groups.push({
      id: `mirrors-${order}`,
      title: "Synced copies",
      why: `Draft: identical copies of ${root}. Read one, skip the rest.`,
      summary: "Fill this group.",
      suggestedOrder: order,
      hunkRefs: [...new Set(paths)],
    });
    order += 1;
  }
  if (mechanical.length > 0) {
    groups.push({
      id: "mechanical",
      title: "Mechanical",
      why: "Draft: renames, copies, moves, or generated output. Say what the reader can skip.",
      summary: "Fill this group.",
      suggestedOrder: order,
      hunkRefs: mechanical,
    });
  }
  const document = { ...skeleton, source, groups };
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(document, null, 2)}\n`);
  const loaded = await loadDocument(dataPath);
  return { document: loaded, index };
}

/**
 * Carry an existing review over to the range's current commits. Refs follow their hunks,
 * refs whose hunk left the diff are dropped, and new hunks land in a draft update group.
 * Returns the report; `changed` is false when both commits are the ones the document names.
 */
export async function cmdRefresh(
  cwd: string,
  dataPath: string,
  base: string | undefined,
  head: string | undefined,
): Promise<{ document: ReviewDocument; report: string; changed: boolean }> {
  const document = await loadDocument(dataPath);
  const previous = document.source;
  if (previous.baseSha === undefined || previous.headSha === undefined) {
    throw new Error(
      `refresh needs source.baseSha and source.headSha in ${dataPath}; an older comprehende wrote this document. Run pregroup again.`,
    );
  }
  const { source, baseSha, headSha } = await resolveSource(
    cwd,
    base ?? previous.baseRef,
    head ?? previous.headRef,
  );
  if (baseSha === previous.baseSha && headSha === previous.headSha) {
    return {
      document,
      report: `nothing to refresh: ${source.range} still resolves to ${shortSha(baseSha)}...${shortSha(headSha)}`,
      changed: false,
    };
  }
  const previousFiles = await readDiff(cwd, previous.baseSha, previous.headSha);
  const nextFiles = await readDiff(cwd, baseSha, headSha);
  const result = refreshDocument(document, previousFiles, nextFiles, source);
  const commits = await listNewSubjects(cwd, previous.headSha, baseSha, headSha);
  const stalePins = (await staleCommentPins(cwd, result.document, { baseSha, headSha })).map(
    (pin) => pin.id,
  );
  await writeDocument(dataPath, result.document);
  return {
    document: result.document,
    report: formatRefresh(result, nextFiles, { commits, stalePins }),
    changed: true,
  };
}

/** A note when the refs no longer resolve to the commits the document was written for. */
export function sourceDrift(
  source: ReviewSource,
  live: { baseSha: string; headSha: string },
  dataPath: string,
): string | undefined {
  const moved: string[] = [];
  if (source.baseSha !== undefined && source.baseSha !== live.baseSha) {
    moved.push(`base ${shortSha(source.baseSha)} -> ${shortSha(live.baseSha)}`);
  }
  if (source.headSha !== undefined && source.headSha !== live.headSha) {
    moved.push(`head ${shortSha(source.headSha)} -> ${shortSha(live.headSha)}`);
  }
  if (moved.length === 0) {
    return undefined;
  }
  return `${moved.join(", ")} since this review was written. Run: comprehende refresh --data ${dataPath}`;
}
