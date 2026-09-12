import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { git } from "../src/git/exec.ts";
import { initEmptyRepo } from "../src/test/init-repo.ts";
import {
  githubPagesUrl,
  parseGithubRepo,
  parsePrNumber,
  parseSiteName,
  prunePagesReviews,
  publishPagesReview,
  runPagesReview,
  type PagesDest,
} from "./pages-review.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

const pr = (n: number): PagesDest => ({ kind: "pr", pr: n });
const named = (name: string): PagesDest => ({ kind: "name", name });

describe("pages-review urls", () => {
  it("parses GitHub remotes and builds project Pages URLs", () => {
    assert.deepEqual(parseGithubRepo("https://github.com/matemolnar8/comprehende.git"), {
      owner: "matemolnar8",
      repo: "comprehende",
    });
    assert.deepEqual(parseGithubRepo("https://x-access-token:tok@github.com/matemolnar8/comprehende"), {
      owner: "matemolnar8",
      repo: "comprehende",
    });
    assert.deepEqual(parseGithubRepo("git@github.com:matemolnar8/comprehende.git"), {
      owner: "matemolnar8",
      repo: "comprehende",
    });
    assert.equal(
      githubPagesUrl("https://github.com/matemolnar8/comprehende.git", pr(12)),
      "https://matemolnar8.github.io/comprehende/pr/12/",
    );
    assert.equal(
      githubPagesUrl("https://github.com/matemolnar8/comprehende.git", named("demo")),
      "https://matemolnar8.github.io/comprehende/site/demo/",
    );
    assert.equal(
      githubPagesUrl("git@github.com:alice/alice.github.io.git", pr(3)),
      "https://alice.github.io/pr/3/",
    );
    assert.equal(
      githubPagesUrl("git@github.com:alice/alice.github.io.git", named("preview")),
      "https://alice.github.io/site/preview/",
    );
  });

  it("rejects junk dests", () => {
    assert.equal(parsePrNumber("12"), 12);
    assert.throws(() => parsePrNumber("0"));
    assert.throws(() => parsePrNumber("../etc"));
    assert.throws(() => parsePrNumber("12abc"));
    assert.equal(parseSiteName("demo"), "demo");
    assert.equal(parseSiteName("a"), "a");
    assert.equal(parseSiteName("my-preview"), "my-preview");
    assert.throws(() => parseSiteName("Demo"));
    assert.throws(() => parseSiteName("../etc"));
    assert.throws(() => parseSiteName("has_underscore"));
    assert.throws(() => parseSiteName(""));
  });
});

describe("pages-review publish and prune", () => {
  it("publishes to pr/<n>/, keeps sibling reviews, then prunes on close and TTL", async () => {
    const ctx = await setupRemoteRepo();
    const siteA = await writeExport(ctx.root, "site-a", "alpha");
    const siteB = await writeExport(ctx.root, "site-b", "beta");
    const t0 = new Date("2026-08-01T00:00:00.000Z");
    const t1 = new Date("2026-09-01T00:00:00.000Z");
    const now = new Date("2026-09-12T00:00:00.000Z");

    const publishedA = await publishPagesReview({
      repo: ctx.repo,
      dir: siteA,
      dest: pr(12),
      now: t0,
    });
    assert.equal(publishedA.pushed, true);

    const publishedB = await publishPagesReview({
      repo: ctx.repo,
      dir: siteB,
      dest: pr(13),
      now: t1,
    });
    assert.equal(publishedB.pushed, true);

    let pages = await checkoutPages(ctx);
    assert.equal(existsSync(join(pages, ".nojekyll")), true);
    assert.equal(await readFile(join(pages, "pr/12/index.html"), "utf8"), "<p>alpha</p>\n");
    assert.equal(await readFile(join(pages, "pr/13/index.html"), "utf8"), "<p>beta</p>\n");
    const listing = await readFile(join(pages, "index.html"), "utf8");
    assert.match(listing, /PR #13/);
    assert.match(listing, /PR #12/);
    assert.equal(existsSync(join(pages, "pr/12/published.json")), true);

    const closed = await prunePagesReviews({ repo: ctx.repo, pr: 12 });
    assert.deepEqual(closed.removed, [pr(12)]);

    pages = await checkoutPages(ctx);
    assert.equal(existsSync(join(pages, "pr/12")), false);
    assert.equal(existsSync(join(pages, "pr/13/index.html")), true);
    assert.doesNotMatch(await readFile(join(pages, "index.html"), "utf8"), /PR #12/);

    const expired = await prunePagesReviews({ repo: ctx.repo, ttlDays: 30, now });
    assert.deepEqual(expired.removed, []);

    const later = await prunePagesReviews({
      repo: ctx.repo,
      ttlDays: 10,
      now: new Date("2026-09-20T00:00:00.000Z"),
    });
    assert.deepEqual(later.removed, [pr(13)]);

    pages = await checkoutPages(ctx);
    assert.equal(existsSync(join(pages, "pr/13")), false);
    assert.match(await readFile(join(pages, "index.html"), "utf8"), /No published sites right now/);
  });

  it("publishes named sites under site/<slug>/ and leaves them when a PR closes", async () => {
    const ctx = await setupRemoteRepo();
    const t0 = new Date("2026-08-01T00:00:00.000Z");
    await publishPagesReview({
      repo: ctx.repo,
      dir: await writeExport(ctx.root, "named", "named"),
      dest: named("demo"),
      now: t0,
    });
    await publishPagesReview({
      repo: ctx.repo,
      dir: await writeExport(ctx.root, "pr-site", "pr"),
      dest: pr(8),
      now: t0,
    });

    let pages = await checkoutPages(ctx);
    assert.equal(await readFile(join(pages, "site/demo/index.html"), "utf8"), "<p>named</p>\n");
    const listing = await readFile(join(pages, "index.html"), "utf8");
    assert.match(listing, /site\/demo/);
    assert.match(listing, />demo</);
    assert.match(listing, /PR #8/);

    const closed = await prunePagesReviews({ repo: ctx.repo, pr: 8 });
    assert.deepEqual(closed.removed, [pr(8)]);
    pages = await checkoutPages(ctx);
    assert.equal(existsSync(join(pages, "pr/8")), false);
    assert.equal(existsSync(join(pages, "site/demo/index.html")), true);

    const byName = await prunePagesReviews({ repo: ctx.repo, name: "demo" });
    assert.deepEqual(byName.removed, [named("demo")]);
    pages = await checkoutPages(ctx);
    assert.equal(existsSync(join(pages, "site/demo")), false);
  });

  it("drops named sites on TTL", async () => {
    const ctx = await setupRemoteRepo();
    await publishPagesReview({
      repo: ctx.repo,
      dir: await writeExport(ctx.root, "old", "old"),
      dest: named("stale"),
      now: new Date("2026-08-01T00:00:00.000Z"),
    });
    const expired = await prunePagesReviews({
      repo: ctx.repo,
      ttlDays: 10,
      now: new Date("2026-09-20T00:00:00.000Z"),
    });
    assert.deepEqual(expired.removed, [named("stale")]);
  });

  it("replaces an existing folder on republish", async () => {
    const ctx = await setupRemoteRepo();
    const first = await writeExport(ctx.root, "v1", "one");
    const second = await writeExport(ctx.root, "v2", "two");
    await publishPagesReview({ repo: ctx.repo, dir: first, dest: pr(4) });
    await publishPagesReview({ repo: ctx.repo, dir: second, dest: pr(4) });
    await publishPagesReview({ repo: ctx.repo, dir: first, dest: named("demo") });
    await publishPagesReview({ repo: ctx.repo, dir: second, dest: named("demo") });
    const pages = await checkoutPages(ctx);
    assert.equal(await readFile(join(pages, "pr/4/index.html"), "utf8"), "<p>two</p>\n");
    assert.equal(await readFile(join(pages, "site/demo/index.html"), "utf8"), "<p>two</p>\n");
  });

  it("prunes nothing when gh-pages is missing", async () => {
    const ctx = await setupRemoteRepo();
    const result = await prunePagesReviews({ repo: ctx.repo, pr: 1, ttlDays: 30 });
    assert.deepEqual(result, { removed: [], pushed: false });
  });

  it("replays onto gh-pages when another publish rewrites the listing", async () => {
    const ctx = await setupRemoteRepo();
    await publishPagesReview({
      repo: ctx.repo,
      dir: await writeExport(ctx.root, "a", "a"),
      dest: pr(12),
    });
    const competitor = await cloneCompetitor(ctx);
    const siteB = await writeExport(ctx.root, "b", "b");
    const siteC = await writeExport(ctx.root, "c", "c");
    await publishPagesReview({
      repo: ctx.repo,
      dir: siteB,
      dest: named("demo"),
      beforePush: async () => {
        await publishPagesReview({ repo: competitor, dir: siteC, dest: pr(99) });
      },
    });
    const pages = await checkoutPages(ctx);
    assert.equal(existsSync(join(pages, "pr/12/index.html")), true);
    assert.equal(existsSync(join(pages, "site/demo/index.html")), true);
    assert.equal(existsSync(join(pages, "pr/99/index.html")), true);
    const listing = await readFile(join(pages, "index.html"), "utf8");
    assert.match(listing, /PR #12/);
    assert.match(listing, /site\/demo/);
    assert.match(listing, /PR #99/);
  });

  it("publishes and prunes through the CLI", async () => {
    const ctx = await setupRemoteRepo();
    const site = await writeExport(ctx.root, "cli", "cli");
    assert.equal(await runPagesReview(["publish", "--repo", ctx.repo, "--dir", site, "--pr", "9"]), 0);
    assert.equal(await runPagesReview(["publish", "--repo", ctx.repo, "--dir", site, "--name", "demo"]), 0);
    let pages = await checkoutPages(ctx);
    assert.equal(existsSync(join(pages, "pr/9/index.html")), true);
    assert.equal(existsSync(join(pages, "site/demo/index.html")), true);
    assert.equal(await runPagesReview(["prune", "--repo", ctx.repo, "--pr", "9"]), 0);
    assert.equal(await runPagesReview(["prune", "--repo", ctx.repo, "--name", "demo"]), 0);
    pages = await checkoutPages(ctx);
    assert.equal(existsSync(join(pages, "pr/9")), false);
    assert.equal(existsSync(join(pages, "site/demo")), false);
  });

  it("rejects publish with both --pr and --name", async () => {
    const ctx = await setupRemoteRepo();
    const site = await writeExport(ctx.root, "cli", "cli");
    assert.equal(
      await runPagesReview(["publish", "--repo", ctx.repo, "--dir", site, "--pr", "9", "--name", "demo"]),
      1,
    );
  });
});

type RemoteRepo = {
  root: string;
  repo: string;
  bare: string;
};

async function setupRemoteRepo(): Promise<RemoteRepo> {
  const root = await mkdtemp(join(tmpdir(), "comprehende-pages-test-"));
  roots.push(root);
  const repo = join(root, "repo");
  const bare = join(root, "remote.git");
  await initEmptyRepo(repo);
  await writeFile(join(repo, "README.md"), "# test\n");
  await git(repo, ["add", "."]);
  await git(repo, ["commit", "-m", "init"]);
  await mkdir(bare, { recursive: true });
  await git(bare, ["init", "--bare", "-b", "main"]);
  await git(repo, ["remote", "add", "origin", bare]);
  await git(repo, ["push", "-u", "origin", "main"]);
  return { root, repo, bare };
}

async function cloneCompetitor(ctx: RemoteRepo): Promise<string> {
  const competitor = join(ctx.root, "competitor");
  await git(ctx.root, ["clone", ctx.repo, competitor]);
  await git(competitor, ["remote", "set-url", "origin", ctx.bare]);
  await git(competitor, ["config", "user.email", "comprehende@example.com"]);
  await git(competitor, ["config", "user.name", "Comprehende Fixture"]);
  await git(competitor, ["config", "commit.gpgsign", "false"]);
  return competitor;
}

async function writeExport(root: string, name: string, body: string): Promise<string> {
  const dir = join(root, name);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), `<p>${body}</p>\n`);
  await mkdir(join(dir, "api"), { recursive: true });
  await writeFile(join(dir, "api/review.json"), "{}\n");
  return dir;
}

async function checkoutPages(ctx: RemoteRepo): Promise<string> {
  const dest = join(ctx.root, `pages-${crypto.randomUUID()}`);
  await git(ctx.root, ["clone", "--branch", "gh-pages", "--single-branch", ctx.bare, dest]);
  return dest;
}
