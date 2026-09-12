#!/usr/bin/env node

import { realpathSync } from "node:fs";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { git, gitOk } from "../src/git/exec.ts";

export const PAGES_BRANCH = "gh-pages";
export const DEFAULT_TTL_DAYS = 30;
export const PUBLISHED_FILE = "published.json";

const PR_FOLDER = /^[1-9][0-9]*$/;
const NAME_FOLDER = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export type PagesDest = { kind: "pr"; pr: number } | { kind: "name"; name: string };

export type PublishedMeta = PagesDest & { publishedAt: string };

export type PublishPagesOpts = {
  repo: string;
  dir: string;
  dest: PagesDest;
  remote?: string;
  branch?: string;
  now?: Date;
  beforePush?: () => Promise<void>;
};

export type PrunePagesOpts = {
  repo: string;
  pr?: number;
  name?: string;
  ttlDays?: number;
  remote?: string;
  branch?: string;
  now?: Date;
  beforePush?: () => Promise<void>;
};

export type PagesResult = {
  url?: string;
  removed: PagesDest[];
  pushed: boolean;
};

export const PAGES_USAGE = `Usage: pnpm exec tsx scripts/pages-review.ts <command>

Commands:
  publish --dir <export> (--pr <n> | --name <slug>)   Copy a static site onto gh-pages
  prune [--pr <n>] [--name <slug>] [--ttl-days <n>]   Remove a site and/or sites older than the TTL
  init                                                Create gh-pages with .nojekyll if it is missing

Options:
  --repo <path>     Git work tree (default: cwd)
  --remote <name>   Remote that receives gh-pages (default: origin)
  --branch <name>   Pages branch (default: gh-pages)
  --dir <path>      Folder with index.html
  --pr <n>          Pull request number (dest pr/<n>/)
  --name <slug>     Named site (dest site/<slug>/)
  --ttl-days <n>    Age in days after which a site is removed (default: ${DEFAULT_TTL_DAYS})
`;

export function parsePrNumber(raw: string): number {
  if (!PR_FOLDER.test(raw)) {
    throw new Error(`PR number must be a positive integer, got ${JSON.stringify(raw)}`);
  }
  return Number(raw);
}

export function parseSiteName(raw: string): string {
  if (!NAME_FOLDER.test(raw)) {
    throw new Error(`site name must be a lowercase slug, got ${JSON.stringify(raw)}`);
  }
  return raw;
}

export function parseGithubRepo(remoteUrl: string): { owner: string; repo: string } | undefined {
  const trimmed = remoteUrl.trim().replace(/\.git$/u, "");
  const https = trimmed.match(/^https?:\/\/(?:[^@/]+@)?github\.com\/([^/]+)\/([^/]+)$/u);
  if (https?.[1] !== undefined && https[2] !== undefined) {
    return { owner: https[1], repo: https[2] };
  }
  const ssh = trimmed.match(/^(?:ssh:\/\/)?git@github\.com:([^/]+)\/([^/]+)$/u);
  if (ssh?.[1] !== undefined && ssh[2] !== undefined) {
    return { owner: ssh[1], repo: ssh[2] };
  }
  return undefined;
}

export function githubPagesUrl(remoteUrl: string, dest: PagesDest): string {
  const parsed = parseGithubRepo(remoteUrl);
  if (parsed === undefined) {
    throw new Error(`origin is not a GitHub remote: ${remoteUrl}`);
  }
  const { owner, repo } = parsed;
  const folder = destFolder(dest);
  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return `https://${owner}.github.io/${folder}/`;
  }
  return `https://${owner}.github.io/${repo}/${folder}/`;
}

export function pagesIndexHtml(sites: PublishedMeta[]): string {
  const items = [...sites].sort(comparePublished);
  const body =
    items.length === 0
      ? "<p>No published sites right now.</p>\n"
      : `<ul>\n${items
          .map((item) => {
            const day = item.publishedAt.slice(0, 10);
            return `      <li><a href="${destHref(item)}">${escapeHtml(destLabel(item))}</a> <time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(day)}</time></li>`;
          })
          .join("\n")}\n    </ul>\n`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Published sites</title>
  </head>
  <body>
    <h1>Published sites</h1>
    <p>A workflow removes a pull request folder when that pull request closes. Sites older than ${DEFAULT_TTL_DAYS} days are dropped.</p>
    ${body}  </body>
</html>
`;
}

export async function publishPagesReview(opts: PublishPagesOpts): Promise<PagesResult> {
  const dest = requireDest(opts.dest);
  const indexPath = join(opts.dir, "index.html");
  const index = await readFile(indexPath, "utf8").catch(() => "");
  if (index === "") {
    throw new Error(`export is missing index.html: ${opts.dir}`);
  }
  const now = opts.now ?? new Date();
  const meta: PublishedMeta = { ...dest, publishedAt: now.toISOString() };
  const ctx = { ...opts, createIfMissing: true };
  return withPagesWorktree(ctx, async (pagesDir, remoteUrl) => {
    const pages = requirePages(pagesDir);
    const pushed = await applyAndPush(pages, ctx, publishMessage(dest), async () => {
      const folder = destDir(pages, dest);
      await rm(folder, { recursive: true, force: true });
      await mkdir(folder, { recursive: true });
      await cp(opts.dir, folder, { recursive: true });
      await writeFile(join(folder, PUBLISHED_FILE), `${JSON.stringify(meta)}\n`);
      await writeScaffold(pages);
    });
    return { url: pagesUrlOrUndefined(remoteUrl, dest), removed: [], pushed };
  });
}

export async function prunePagesReviews(opts: PrunePagesOpts): Promise<PagesResult> {
  if (opts.pr === undefined && opts.name === undefined && opts.ttlDays === undefined) {
    throw new Error("prune needs --pr, --name, and/or --ttl-days");
  }
  const now = opts.now ?? new Date();
  const ctx = { ...opts, createIfMissing: false };
  return withPagesWorktree(ctx, async (pages) => {
    if (pages === undefined) {
      return { removed: [], pushed: false };
    }
    const removed: PagesDest[] = [];
    const pushed = await applyAndPush(pages, ctx, () => pruneMessage(removed), async () => {
      removed.length = 0;
      const sites = await listPublished(pages);
      for (const site of sites) {
        if (matchesPrune(site, opts, now)) {
          removed.push(destOf(site));
        }
      }
      if (removed.length === 0) {
        return;
      }
      for (const dest of removed) {
        await rm(destDir(pages, dest), { recursive: true, force: true });
      }
      await writeScaffold(pages);
    });
    return { removed, pushed };
  });
}

function publishMessage(dest: PagesDest): string {
  return dest.kind === "pr" ? `Publish review for PR #${dest.pr}` : `Publish site ${dest.name}`;
}

function pruneMessage(removed: PagesDest[]): string {
  const dest = removed[0];
  if (removed.length === 1 && dest !== undefined) {
    return dest.kind === "pr" ? `Remove Pages review for PR #${dest.pr}` : `Remove Pages site ${dest.name}`;
  }
  return `Remove Pages sites ${removed.map(destLabel).join(", ")}`;
}

export async function initPagesBranch(opts: { repo: string; remote?: string; branch?: string }): Promise<PagesResult> {
  const ctx = { ...opts, createIfMissing: true };
  return withPagesWorktree(ctx, async (pagesDir) => {
    const pages = requirePages(pagesDir);
    const pushed = await applyAndPush(pages, ctx, "Initialize GitHub Pages", async () => {
      await writeScaffold(pages);
    });
    return { removed: [], pushed };
  });
}

type PagesCtx = {
  repo: string;
  remote?: string;
  branch?: string;
  createIfMissing: boolean;
  beforePush?: () => Promise<void>;
};

async function withPagesWorktree<T>(
  opts: PagesCtx,
  fn: (pages: string | undefined, remoteUrl: string) => Promise<T>,
): Promise<T> {
  const repo = await gitRoot(opts.repo);
  const remote = opts.remote ?? "origin";
  const branch = opts.branch ?? PAGES_BRANCH;
  const remoteUrl = (await git(repo, ["remote", "get-url", remote])).trim();
  await ensureGitIdentity(repo);
  await git(repo, ["fetch", remote, `${branch}:refs/remotes/${remote}/${branch}`], { allowFail: true });
  await git(repo, ["worktree", "prune"]);

  const hasRemoteBranch = await gitOk(repo, ["rev-parse", "--verify", `refs/remotes/${remote}/${branch}`]);
  if (!hasRemoteBranch && !opts.createIfMissing) {
    return fn(undefined, remoteUrl);
  }

  const pages = await mkdtemp(join(tmpdir(), "comprehende-pages-"));
  try {
    if (hasRemoteBranch) {
      await git(repo, ["worktree", "add", "-B", branch, pages, `refs/remotes/${remote}/${branch}`]);
    } else {
      await git(repo, ["worktree", "add", "--orphan", "-b", branch, pages]);
    }
    await ensureGitIdentity(pages);
    await git(pages, ["config", "commit.gpgsign", "false"]);
    return await fn(pages, remoteUrl);
  } finally {
    await git(repo, ["worktree", "remove", "--force", pages], { allowFail: true });
    await git(repo, ["worktree", "prune"], { allowFail: true });
    rmSync(pages, { recursive: true, force: true });
  }
}

async function writeScaffold(pages: string): Promise<void> {
  await writeFile(join(pages, ".nojekyll"), "");
  const sites = await listPublished(pages);
  await writeFile(join(pages, "index.html"), pagesIndexHtml(sites));
}

async function listPublished(pages: string): Promise<PublishedMeta[]> {
  const sites: PublishedMeta[] = [];
  await collectPublished(sites, join(pages, "pr"), (name) =>
    PR_FOLDER.test(name) ? { kind: "pr", pr: Number(name) } : undefined,
  );
  await collectPublished(sites, join(pages, "site"), (name) =>
    NAME_FOLDER.test(name) ? { kind: "name", name } : undefined,
  );
  return sites;
}

async function collectPublished(
  sites: PublishedMeta[],
  root: string,
  destFromName: (name: string) => PagesDest | undefined,
): Promise<void> {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const dest = destFromName(entry.name);
    if (dest === undefined) {
      continue;
    }
    const raw = await readFile(join(root, entry.name, PUBLISHED_FILE), "utf8").catch(() => "");
    sites.push(parsePublished(raw, dest));
  }
}

function parsePublished(raw: string, dest: PagesDest): PublishedMeta {
  if (raw.trim() === "") {
    return { ...dest, publishedAt: "1970-01-01T00:00:00.000Z" };
  }
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || typeof parsed.publishedAt !== "string" || parsed.publishedAt === "") {
    return { ...dest, publishedAt: "1970-01-01T00:00:00.000Z" };
  }
  return { ...dest, publishedAt: parsed.publishedAt };
}

function matchesPrune(site: PublishedMeta, opts: PrunePagesOpts, now: Date): boolean {
  if (opts.pr !== undefined && site.kind === "pr" && site.pr === opts.pr) {
    return true;
  }
  if (opts.name !== undefined && site.kind === "name" && site.name === opts.name) {
    return true;
  }
  return opts.ttlDays !== undefined && ageDays(site.publishedAt, now) >= opts.ttlDays;
}

async function applyAndPush(
  pages: string,
  opts: PagesCtx,
  message: string | (() => string),
  apply: () => Promise<void>,
): Promise<boolean> {
  const remote = opts.remote ?? "origin";
  const branch = opts.branch ?? PAGES_BRANCH;
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      await git(pages, ["fetch", remote, `${branch}:refs/remotes/${remote}/${branch}`], { allowFail: true });
      const hasRemote = await gitOk(pages, ["rev-parse", "--verify", `refs/remotes/${remote}/${branch}`]);
      if (!hasRemote) {
        break;
      }
      await git(pages, ["reset", "--hard", `refs/remotes/${remote}/${branch}`]);
    }
    await apply();
    await git(pages, ["add", "-A"]);
    const dirty = (await git(pages, ["status", "--porcelain"])).trim();
    if (dirty === "") {
      return attempt > 0;
    }
    const commitMessage = typeof message === "function" ? message() : message;
    await git(pages, ["commit", "-m", commitMessage]);
    try {
      if (attempt === 0 && opts.beforePush !== undefined) {
        await opts.beforePush();
      }
      await git(pages, ["push", remote, `HEAD:${branch}`]);
      return true;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("git push to gh-pages failed");
}

async function gitRoot(cwd: string): Promise<string> {
  return (await git(cwd, ["rev-parse", "--show-toplevel"])).trim();
}

async function ensureGitIdentity(cwd: string): Promise<void> {
  const name = (await git(cwd, ["config", "--get", "user.name"], { allowFail: true })).trim();
  const email = (await git(cwd, ["config", "--get", "user.email"], { allowFail: true })).trim();
  if (name === "") {
    await git(cwd, ["config", "user.name", "comprehende-pages"]);
  }
  if (email === "") {
    await git(cwd, ["config", "user.email", "pages@comprehende.local"]);
  }
}

function ageDays(publishedAt: string, now: Date): number {
  const then = Date.parse(publishedAt);
  if (!Number.isFinite(then)) {
    return Number.POSITIVE_INFINITY;
  }
  return (now.getTime() - then) / (24 * 60 * 60 * 1000);
}

function pagesUrlOrUndefined(remoteUrl: string, dest: PagesDest): string | undefined {
  try {
    return githubPagesUrl(remoteUrl, dest);
  } catch {
    return undefined;
  }
}

function requireDest(dest: PagesDest): PagesDest {
  if (dest.kind === "pr") {
    if (!Number.isInteger(dest.pr) || dest.pr < 1) {
      throw new Error(`PR number must be a positive integer, got ${JSON.stringify(dest.pr)}`);
    }
    return dest;
  }
  return { kind: "name", name: parseSiteName(dest.name) };
}

function destOf(site: PublishedMeta): PagesDest {
  return site.kind === "pr" ? { kind: "pr", pr: site.pr } : { kind: "name", name: site.name };
}

function destFolder(dest: PagesDest): string {
  return dest.kind === "pr" ? `pr/${dest.pr}` : `site/${dest.name}`;
}

function destDir(pages: string, dest: PagesDest): string {
  return dest.kind === "pr" ? join(pages, "pr", String(dest.pr)) : join(pages, "site", dest.name);
}

function destHref(dest: PagesDest): string {
  return `./${destFolder(dest)}/`;
}

function destLabel(dest: PagesDest): string {
  return dest.kind === "pr" ? `PR #${dest.pr}` : dest.name;
}

function comparePublished(a: PublishedMeta, b: PublishedMeta): number {
  const byTime = b.publishedAt.localeCompare(a.publishedAt);
  if (byTime !== 0) {
    return byTime;
  }
  if (a.kind === "pr" && b.kind === "pr") {
    return b.pr - a.pr;
  }
  if (a.kind === "pr") {
    return -1;
  }
  if (b.kind === "pr") {
    return 1;
  }
  return a.name.localeCompare(b.name);
}

function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requirePages(pages: string | undefined): string {
  if (pages === undefined) {
    throw new Error("gh-pages work tree is missing");
  }
  return pages;
}

export async function runPagesReview(argv: string[]): Promise<number> {
  const args = argv[0] === "--" ? argv.slice(1) : [...argv];
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    console.log(PAGES_USAGE);
    return 0;
  }
  const command = args[0];
  const flags = parseFlags(args.slice(1));
  const repo = flags.repo ?? process.cwd();
  try {
    if (command === "publish") {
      const dest = publishDest(flags);
      if (flags.dir === undefined || dest === undefined) {
        console.error("publish needs --dir and exactly one of --pr or --name\n");
        console.error(PAGES_USAGE);
        return 1;
      }
      const result = await publishPagesReview({
        repo,
        dir: flags.dir,
        dest,
        remote: flags.remote,
        branch: flags.branch,
      });
      if (result.url !== undefined) {
        console.log(result.url);
      }
      return 0;
    }
    if (command === "prune") {
      const ttlDays = flags.ttlDays === undefined ? undefined : Number(flags.ttlDays);
      if (flags.ttlDays !== undefined && (!Number.isFinite(ttlDays) || (ttlDays ?? 0) < 0)) {
        console.error("--ttl-days must be a non-negative number");
        return 1;
      }
      if (flags.pr === undefined && flags.name === undefined && flags.ttlDays === undefined) {
        console.error("prune needs --pr, --name, and/or --ttl-days\n");
        console.error(PAGES_USAGE);
        return 1;
      }
      const result = await prunePagesReviews({
        repo,
        pr: flags.pr === undefined ? undefined : parsePrNumber(flags.pr),
        name: flags.name === undefined ? undefined : parseSiteName(flags.name),
        ttlDays,
        remote: flags.remote,
        branch: flags.branch,
      });
      if (result.removed.length === 0) {
        console.log("nothing to prune");
      } else {
        console.log(`removed ${result.removed.map(destLabel).join(", ")}`);
      }
      return 0;
    }
    if (command === "init") {
      await initPagesBranch({ repo, remote: flags.remote, branch: flags.branch });
      return 0;
    }
    console.error(`Unknown command: ${command}\n`);
    console.error(PAGES_USAGE);
    return 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 1;
  }
}

type Flags = {
  repo?: string;
  remote?: string;
  branch?: string;
  dir?: string;
  pr?: string;
  name?: string;
  ttlDays?: string;
};

function publishDest(flags: Flags): PagesDest | undefined {
  if (flags.pr !== undefined && flags.name !== undefined) {
    return undefined;
  }
  if (flags.pr !== undefined) {
    return { kind: "pr", pr: parsePrNumber(flags.pr) };
  }
  if (flags.name !== undefined) {
    return { kind: "name", name: parseSiteName(flags.name) };
  }
  return undefined;
}

function parseFlags(args: string[]): Flags {
  const flags: Flags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--repo" && next !== undefined) {
      flags.repo = next;
      i++;
      continue;
    }
    if (arg === "--remote" && next !== undefined) {
      flags.remote = next;
      i++;
      continue;
    }
    if (arg === "--branch" && next !== undefined) {
      flags.branch = next;
      i++;
      continue;
    }
    if (arg === "--dir" && next !== undefined) {
      flags.dir = next;
      i++;
      continue;
    }
    if (arg === "--pr" && next !== undefined) {
      flags.pr = next;
      i++;
      continue;
    }
    if (arg === "--name" && next !== undefined) {
      flags.name = next;
      i++;
      continue;
    }
    if (arg === "--ttl-days" && next !== undefined) {
      flags.ttlDays = next;
      i++;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  return flags;
}

const thisFile = fileURLToPath(import.meta.url);
if (isPagesCliEntry(thisFile, process.argv[1])) {
  const code = await runPagesReview(process.argv.slice(2));
  process.exitCode = code;
}

function isPagesCliEntry(modulePath: string, argv1: string | undefined): boolean {
  if (argv1 === undefined) {
    return false;
  }
  try {
    return realpathSync(modulePath) === realpathSync(argv1);
  } catch {
    return resolve(modulePath) === resolve(argv1);
  }
}
