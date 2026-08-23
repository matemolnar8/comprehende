import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { ApiError } from "../api/error.ts";
import { openReview, pinReviewSource, renderResource, snapshotJson, type PinnedRange, type Snapshot } from "../api/live.ts";
import { parseApiPath } from "../api/paths.ts";
import { GitError } from "../git/exec.ts";
import { findPackageRoot } from "../package-root.ts";

export type ServeOptions = {
  cwd: string;
  dataPath: string;
  port: number;
  uiRoot?: string;
  pin?: PinnedRange;
};

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".map": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

export type RunningServer = {
  server: Server;
  port: number;
  url: string;
};

export async function startServer(opts: ServeOptions): Promise<RunningServer> {
  const uiRoot = opts.uiRoot ?? join(findPackageRoot(), "dist/ui");
  const pin = opts.pin ?? (await pinReviewSource(opts.cwd, opts.dataPath));
  const bound: ServeOptions = { ...opts, pin };
  const server = createServer((req, res) => {
    void handle(req, res, bound, uiRoot);
  });

  await new Promise<void>((resolveListen, reject) => {
    server.listen(opts.port, "127.0.0.1", () => resolveListen());
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
    const resource = parseApiPath(url.pathname);
    if (resource !== undefined) {
      const ctx = await openReview(opts.cwd, opts.dataPath, opts.pin);
      sendSnapshot(res, 200, await renderResource(ctx, resource));
      return;
    }
    await serveStatic(res, uiRoot, url.pathname);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : String(error);
    const extra = error instanceof GitError ? { stderr: error.stderr } : {};
    json(res, status, { error: message, ...extra });
  }
}

function sendSnapshot(res: ServerResponse, status: number, snapshot: Snapshot): void {
  if (snapshot.encoding === "json") {
    json(res, status, snapshot.body);
    return;
  }
  const body = Buffer.from(snapshot.body);
  res.writeHead(status, {
    "content-type": snapshot.mediaType,
    "cache-control": "no-store",
    "content-length": body.byteLength,
  });
  res.end(body);
}

function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = snapshotJson(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function serveStatic(res: ServerResponse, uiRoot: string, pathname: string): Promise<void> {
  if (!existsSync(uiRoot)) {
    throw new ApiError(
      503,
      "UI is missing from this install. Reinstall comprehende from npm, or from a git checkout run `pnpm build`.",
    );
  }
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const uiAbs = resolve(uiRoot);
  const candidate = resolve(uiRoot, relative);
  if (candidate !== uiAbs && !candidate.startsWith(`${uiAbs}/`)) {
    throw new ApiError(400, "invalid path");
  }
  if (!existsSync(candidate) || !statSync(candidate).isFile()) {
    throw new ApiError(404, "not found");
  }
  const stream = createReadStream(candidate);
  res.writeHead(200, {
    "content-type": MIME[extname(candidate)] ?? "application/octet-stream",
    "cache-control": pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-store",
  });
  stream.pipe(res);
}

/** Static file server for an exported site. No git. Used by tests to prove the folder is self-contained. */
export async function startStaticSite(root: string, port = 0): Promise<RunningServer> {
  const server = createServer((req, res) => {
    void (async () => {
      try {
        if (req.method !== "GET") {
          json(res, 405, { error: "method not allowed" });
          return;
        }
        const host = req.headers.host ?? "127.0.0.1";
        const url = new URL(req.url ?? "/", `http://${host}`);
        const relative = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.replace(/^\/+/, ""));
        if (relative.split("/").includes("..")) {
          throw new ApiError(400, "invalid path");
        }
        const abs = resolve(root, relative);
        const rootAbs = resolve(root);
        if (abs !== rootAbs && !abs.startsWith(`${rootAbs}/`)) {
          throw new ApiError(400, "invalid path");
        }
        if (!existsSync(abs) || !statSync(abs).isFile()) {
          throw new ApiError(404, "not found");
        }
        const stream = createReadStream(abs);
        res.writeHead(200, {
          "content-type": MIME[extname(abs)] ?? "application/octet-stream",
        });
        stream.pipe(res);
      } catch (error) {
        const status = error instanceof ApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : String(error);
        json(res, status, { error: message });
      }
    })();
  });

  await new Promise<void>((resolveListen, reject) => {
    server.listen(port, "127.0.0.1", () => resolveListen());
    server.once("error", reject);
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("static site failed to bind 127.0.0.1");
  }
  return { server, port: address.port, url: `http://127.0.0.1:${address.port}` };
}
