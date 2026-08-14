import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { coverReview } from "../review/coverage.ts";
import { reviewEffort } from "../review/effort.ts";
import { fileLanguage, filePatchFromGit, readHunkIndex, resolveSource, toHunkRef } from "../git/diff.ts";
import { listCommits } from "../git/log.ts";
import { blameFile } from "../git/blame.ts";
import { showFile } from "../git/show.ts";
import { GitError } from "../git/exec.ts";
import { mergeBase } from "../git/repo.ts";
import { loadDocument } from "../cli/commands.ts";
import { findPackageRoot } from "../package-root.ts";
import type { DiffFile, HunkRef, LiveHunk } from "../schema/types.ts";

export type ServeOptions = {
  cwd: string;
  dataPath: string;
  port: number;
};

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".map": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
};

export type RunningServer = {
  server: Server;
  port: number;
  url: string;
};

export async function startServer(opts: ServeOptions): Promise<RunningServer> {
  const uiRoot = join(findPackageRoot(), "dist/ui");
  const server = createServer((req, res) => {
    void handle(req, res, opts, uiRoot);
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(opts.port, "127.0.0.1", () => resolve());
    server.once("error", reject);
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("server failed to bind 127.0.0.1");
  }
  const url = `http://127.0.0.1:${address.port}`;
  return { server, port: address.port, url };
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  opts: ServeOptions,
  uiRoot: string,
): Promise<void> {
  try {
    const host = req.headers.host ?? `127.0.0.1:${opts.port}`;
    const url = new URL(req.url ?? "/", `http://${host}`);
    if (req.method !== "GET") {
      json(res, 405, { error: "method not allowed" });
      return;
    }
    if (url.pathname === "/api/health") {
      json(res, 200, { ok: true });
      return;
    }
    if (url.pathname === "/api/review") {
      json(res, 200, await reviewPayload(opts));
      return;
    }
    if (url.pathname === "/api/hunks") {
      json(res, 200, await hunksPayload(opts, url.searchParams.get("group")));
      return;
    }
    if (url.pathname === "/api/file") {
      json(res, 200, await filePayload(opts, url.searchParams));
      return;
    }
    if (url.pathname === "/api/blame") {
      json(res, 200, await blamePayload(opts, url.searchParams));
      return;
    }
    await serveStatic(res, uiRoot, url.pathname);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : String(error);
    const extra = error instanceof GitError ? { stderr: error.stderr } : {};
    json(res, status, { error: message, ...extra });
  }
}

class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function reviewPayload(opts: ServeOptions) {
  const document = await loadDocument(opts.dataPath);
  const resolved = await resolveSource(opts.cwd, document.source.baseRef, document.source.headRef);
  const { files, coverage } = await coverReview(opts.cwd, document);
  const index = await readHunkIndex(opts.cwd, document.source.baseRef, document.source.headRef);
  const commits = await listCommits(opts.cwd, document.source.baseRef, document.source.headRef);
  return {
    document,
    resolved: {
      baseRef: document.source.baseRef,
      headRef: document.source.headRef,
      range: document.source.range ?? `${document.source.baseRef}...${document.source.headRef}`,
      baseSha: resolved.baseSha,
      headSha: resolved.headSha,
    },
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
    files: files.map((file) => ({
      path: file.path,
      oldPath: file.oldPath,
      status: file.status,
      binary: file.binary,
      hunkCount: file.hunks.length,
    })),
    skipped: index.skipped,
    commits,
    effort: {
      score: reviewEffort(files.length, coverage.totalHunks),
      files: files.length,
      hunks: coverage.totalHunks,
    },
  };
}

async function hunksPayload(
  opts: ServeOptions,
  groupId: string | null,
): Promise<{ hunks: SerializedHunk[]; files: SerializedFile[] }> {
  if (groupId === null || groupId === "") {
    throw new HttpError(400, "missing group query");
  }
  const document = await loadDocument(opts.dataPath);
  const { files, coverage } = await coverReview(opts.cwd, document);
  if (groupId === "unassigned") {
    return serializeLayer(files, coverage.unassigned);
  }
  const group = coverage.groups.find((item) => item.group.id === groupId);
  if (group === undefined) {
    throw new HttpError(404, `unknown group "${groupId}"`);
  }
  return serializeLayer(files, group.hunks);
}

function serializeLayer(files: DiffFile[], hunks: LiveHunk[]): { hunks: SerializedHunk[]; files: SerializedFile[] } {
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
    const next: SerializedFile = {
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

async function filePayload(opts: ServeOptions, params: URLSearchParams) {
  const path = requiredQuery(params, "path");
  const side = params.get("side") === "old" ? "old" : "new";
  const document = await loadDocument(opts.dataPath);
  const { files } = await coverReview(opts.cwd, document);
  const file = findFile(files, path);
  const lookup = side === "old" ? (file.oldPath ?? file.path) : file.path;
  if (side === "old" && file.status === "added") {
    throw new HttpError(404, "file did not exist on the base side");
  }
  if (side === "new" && file.status === "deleted") {
    throw new HttpError(404, "file does not exist on the head side");
  }
  const ref =
    side === "old" ? await mergeBase(opts.cwd, document.source.baseRef, document.source.headRef) : document.source.headRef;
  try {
    const content = await showFile(opts.cwd, ref, lookup);
    return { path: lookup, ref, side, content, language: fileLanguage(lookup) };
  } catch (error) {
    throw new HttpError(404, error instanceof Error ? error.message : "file not found");
  }
}

async function blamePayload(opts: ServeOptions, params: URLSearchParams) {
  const path = requiredQuery(params, "path");
  const side = params.get("side") === "old" ? "old" : "new";
  const document = await loadDocument(opts.dataPath);
  const { files } = await coverReview(opts.cwd, document);
  const file = findFile(files, path);
  const lookup = side === "old" ? (file.oldPath ?? file.path) : file.path;
  if (side === "old" && file.status === "added") {
    throw new HttpError(404, "file did not exist on the base side");
  }
  if (side === "new" && file.status === "deleted") {
    throw new HttpError(404, "file does not exist on the head side");
  }
  const ref =
    side === "old" ? await mergeBase(opts.cwd, document.source.baseRef, document.source.headRef) : document.source.headRef;
  try {
    const lines = await blameFile(opts.cwd, ref, lookup);
    return { path: lookup, ref, side, lines };
  } catch (error) {
    throw new HttpError(404, error instanceof Error ? error.message : "blame not available");
  }
}

function findFile(files: DiffFile[], path: string): DiffFile {
  const file = files.find((item) => item.path === path || item.oldPath === path);
  if (file === undefined) {
    throw new HttpError(404, `path is not in the live diff: ${path}`);
  }
  return file;
}

function requiredQuery(params: URLSearchParams, name: string): string {
  const value = params.get(name);
  if (value === null || value === "") {
    throw new HttpError(400, `missing ${name}`);
  }
  return value;
}

type SerializedHunk = HunkRef & {
  header: string;
  language: string;
  lines: LiveHunk["lines"];
};

type SerializedFile = {
  path: string;
  oldPath?: string;
  patch: string;
  hunks: SerializedHunk[];
};

function serializeHunk(hunk: LiveHunk): SerializedHunk {
  return {
    ...toHunkRef(hunk),
    header: hunk.header,
    language: fileLanguage(hunk.path),
    lines: hunk.lines,
  };
}

function uniquePaths(hunks: LiveHunk[]): string[] {
  return [...new Set(hunks.map((hunk) => hunk.path))];
}

function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = `${JSON.stringify(body)}\n`;
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function serveStatic(res: ServerResponse, uiRoot: string, pathname: string): Promise<void> {
  if (!existsSync(uiRoot)) {
    throw new HttpError(
      503,
      "UI build is missing. From the comprehende checkout run `pnpm build` (Vite emits dist/ui).",
    );
  }
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const uiAbs = resolve(uiRoot);
  const candidate = resolve(uiRoot, relative);
  if (candidate !== uiAbs && !candidate.startsWith(`${uiAbs}/`)) {
    throw new HttpError(400, "invalid path");
  }
  const filePath = existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(uiRoot, "index.html");
  const stream = createReadStream(filePath);
  res.writeHead(200, {
    "content-type": MIME[extname(filePath)] ?? "application/octet-stream",
    "cache-control": pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-store",
  });
  stream.pipe(res);
}
