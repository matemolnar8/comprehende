#!/usr/bin/env node

import { execFile } from "node:child_process";
import { realpathSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { git } from "../../src/git/exec.ts";
import { findPackageRoot } from "../../src/package-root.ts";
import { ADD_CASE_USAGE, parseAddCaseArgv } from "./args.ts";
import { caseIdFor, githubRepoUrl, linkedIssueNumbers, parseGithubPrUrl } from "./github.ts";
import { ensureBareClone, thisRepoMirror } from "./clone.ts";

const execFileAsync = promisify(execFile);

export async function runAddCase(argv: string[], packageRoot = findPackageRoot()): Promise<number> {
  const request = parseAddCaseArgv(argv);
  if (request.kind === "help") {
    console.log(ADD_CASE_USAGE);
    return 0;
  }
  if (request.kind === "error") {
    console.error(request.message);
    console.error(`\n${ADD_CASE_USAGE}`);
    return 1;
  }
  const parsed = parseGithubPrUrl(request.prUrl);
  const id = request.id ?? caseIdFor(parsed.repo, parsed.pr);
  const caseDir = join(packageRoot, "eval/cases", id);
  const sourcesDir = join(caseDir, "sources");
  await mkdir(sourcesDir, { recursive: true });

  const pr = asRecord(await ghJson(["api", `repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.pr}`]));
  const reviewComments = await ghJsonList([
    "api",
    "--paginate",
    "--slurp",
    `repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.pr}/comments`,
  ]);
  const conversationComments = await ghJsonList([
    "api",
    "--paginate",
    "--slurp",
    `repos/${parsed.owner}/${parsed.repo}/issues/${parsed.pr}/comments`,
  ]);
  await writeJson(join(sourcesDir, "pr.json"), trimPr(pr));
  await writeJson(join(sourcesDir, "review-comments.json"), reviewComments.map(trimReviewComment));
  await writeJson(join(sourcesDir, "comments.json"), conversationComments.map(trimIssueComment));

  const body = typeof pr.body === "string" ? pr.body : "";
  for (const issueNumber of linkedIssueNumbers(body)) {
    try {
      const issue = asRecord(
        await ghJson(["api", `repos/${parsed.owner}/${parsed.repo}/issues/${issueNumber}`]),
      );
      await writeJson(join(sourcesDir, `issue-${issueNumber}.json`), trimIssue(issue));
    } catch (error) {
      console.error(`skip issue #${issueNumber}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const head = nestedSha(pr, "head");
  const mergeSha = typeof pr.merge_commit_sha === "string" ? pr.merge_commit_sha : undefined;
  const repoUrl = githubRepoUrl(parsed.owner, parsed.repo);
  const bare = await ensureBareClone({
    cacheDir: join(packageRoot, "eval/.cache"),
    repoUrl,
    localMirror: await thisRepoMirror(packageRoot, repoUrl),
  });
  const remotes = (await git(bare, ["remote"])).trim().split("\n");
  const remote = remotes.includes("github") ? "github" : "origin";
  await git(bare, [
    "fetch",
    "--prune",
    remote,
    `+refs/pull/${parsed.pr}/head:refs/eval/pr-${parsed.pr}`,
    "+refs/heads/main:refs/heads/main",
    "+refs/heads/master:refs/heads/master",
  ], { allowFail: true });
  let base = nestedSha(pr, "base");
  if (mergeSha !== undefined) {
    await git(bare, ["fetch", remote, mergeSha], { allowFail: true });
    base = (await git(bare, ["rev-parse", "--verify", `${mergeSha}^1`])).trim();
  }

  await writeJson(join(caseDir, "case.json"), {
    id,
    repo: repoUrl,
    pr: parsed.pr,
    base,
    head,
    tags: [],
  });
  console.log(caseDir);
  return 0;
}

async function ghJson(args: string[]): Promise<unknown> {
  const { stdout } = await execFileAsync("gh", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  return JSON.parse(stdout);
}

async function ghJsonList(args: string[]): Promise<unknown[]> {
  const value = await ghJson(args);
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      return value.flat();
    }
    return value;
  }
  throw new Error(`expected JSON array from gh ${args.join(" ")}`);
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("expected a JSON object from GitHub");
  }
  return value as Record<string, unknown>;
}

function nestedSha(pr: Record<string, unknown>, key: "head" | "base"): string {
  const ref = pr[key];
  if (typeof ref !== "object" || ref === null || !("sha" in ref) || typeof ref.sha !== "string" || ref.sha === "") {
    throw new Error(`pull request ${key}.sha is missing`);
  }
  return ref.sha;
}

function trimUser(value: unknown): { login: string } | undefined {
  if (typeof value !== "object" || value === null || !("login" in value) || typeof value.login !== "string") {
    return undefined;
  }
  return { login: value.login };
}

function trimPr(pr: Record<string, unknown>): Record<string, unknown> {
  return {
    html_url: pr.html_url,
    number: pr.number,
    title: pr.title,
    body: pr.body,
    user: trimUser(pr.user),
    merged_at: pr.merged_at,
    merge_commit_sha: pr.merge_commit_sha,
    base: trimRef(pr.base),
    head: trimRef(pr.head),
  };
}

function trimRef(value: unknown): { ref?: unknown; sha?: unknown } | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  const ref = value as Record<string, unknown>;
  return { ref: ref.ref, sha: ref.sha };
}

function trimIssue(issue: Record<string, unknown>): Record<string, unknown> {
  return {
    html_url: issue.html_url,
    number: issue.number,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    user: trimUser(issue.user),
  };
}

function trimReviewComment(value: unknown): Record<string, unknown> {
  const comment = asRecord(value);
  return {
    html_url: comment.html_url,
    user: trimUser(comment.user),
    body: comment.body,
    path: comment.path,
    side: comment.side,
    line: comment.line,
    original_line: comment.original_line,
    original_commit_id: comment.original_commit_id,
    commit_id: comment.commit_id,
  };
}

function trimIssueComment(value: unknown): Record<string, unknown> {
  const comment = asRecord(value);
  return {
    html_url: comment.html_url,
    user: trimUser(comment.user),
    body: comment.body,
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (isAddCaseCliEntry(thisFile, process.argv[1])) {
  process.exitCode = await runAddCase(process.argv.slice(2));
}

export function isAddCaseCliEntry(modulePath: string, argv1: string | undefined): boolean {
  if (argv1 === undefined) {
    return false;
  }
  try {
    if (realpathSync(modulePath) === realpathSync(argv1)) {
      return true;
    }
  } catch {
    // tsx shims
  }
  return resolve(argv1).replaceAll("\\", "/").endsWith("scripts/eval/add-case.ts");
}
