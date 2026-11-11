export type GithubRepo = { owner: string; repo: string };

const PR_URL = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/.*)?$/u;

export function parseGithubPrUrl(url: string): GithubRepo & { pr: number } {
  const match = url.trim().match(PR_URL);
  if (
    match === null ||
    match[1] === undefined ||
    match[2] === undefined ||
    match[3] === undefined
  ) {
    throw new Error(`not a GitHub pull request URL: ${url}`);
  }
  return { owner: match[1], repo: match[2], pr: Number(match[3]) };
}

const COMMIT_URL =
  /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/commit\/([0-9a-f]{7,40})(?:[/?#].*)?$/iu;
const REPO_HTTPS = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/u;
const REPO_SSH = /^git@github\.com:([^/]+)\/([^/]+)$/u;

export function parseGithubCommitUrl(url: string): (GithubRepo & { sha: string }) | undefined {
  const match = normalizeUrl(url).match(COMMIT_URL);
  if (match?.[1] === undefined || match[2] === undefined || match[3] === undefined) {
    return undefined;
  }
  return { owner: match[1], repo: match[2], sha: match[3].toLowerCase() };
}

export function parseGithubRepoRemote(url: string): GithubRepo | undefined {
  const trimmed = url.trim().replace(/\.git$/u, "");
  const https = trimmed.match(REPO_HTTPS);
  if (https?.[1] !== undefined && https[2] !== undefined) {
    return { owner: https[1], repo: https[2] };
  }
  const ssh = trimmed.match(REPO_SSH);
  if (ssh?.[1] !== undefined && ssh[2] !== undefined) {
    return { owner: ssh[1], repo: ssh[2] };
  }
  return undefined;
}

export function shaInRange(sha: string, rangeShas: readonly string[]): boolean {
  const needle = sha.toLowerCase();
  if (!/^[0-9a-f]{7,40}$/u.test(needle)) {
    return false;
  }
  return rangeShas.some((full) => full.toLowerCase().startsWith(needle));
}

export function githubRepoUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}.git`;
}

export function githubCacheName(owner: string, repo: string): string {
  return `${owner}-${repo}.git`;
}

export function caseIdFor(repo: string, pr: number): string {
  return `${repo}-${pr}`;
}

export type LinkedIssue = GithubRepo & { number: number };

/** Issues the text closes in `home`, and issues it links by URL in the repository the URL names. */
export function linkedIssues(text: string, home: GithubRepo): LinkedIssue[] {
  const found = new Map<string, LinkedIssue>();
  const add = (issue: LinkedIssue): void => {
    found.set(`${issue.owner}/${issue.repo}#${issue.number}`.toLowerCase(), issue);
  };
  const close =
    /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#\d+(?:(?:\s*,\s*(?:and\s+)?|\s+and\s+)#\d+)*/giu;
  for (const match of text.matchAll(close)) {
    for (const number of match[0].matchAll(/\d+/gu)) {
      add({ ...home, number: Number(number[0]) });
    }
  }
  const full = /https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/issues\/(\d+)/giu;
  for (const match of text.matchAll(full)) {
    const [, owner, repo, number] = match;
    if (owner !== undefined && repo !== undefined && number !== undefined) {
      add({ owner, repo, number: Number(number) });
    }
  }
  return [...found.values()].sort(
    (a, b) =>
      Number(isSameRepo(b, home)) - Number(isSameRepo(a, home)) ||
      a.owner.localeCompare(b.owner) ||
      a.repo.localeCompare(b.repo) ||
      a.number - b.number,
  );
}

function isSameRepo(a: GithubRepo, b: GithubRepo): boolean {
  return (
    a.owner.toLowerCase() === b.owner.toLowerCase() && a.repo.toLowerCase() === b.repo.toLowerCase()
  );
}

/** An issue of another repository keeps that repository in its file name, so two numbers cannot collide. */
export function issueSourceFileName(issue: LinkedIssue, home: GithubRepo): string {
  return isSameRepo(issue, home)
    ? `issue-${issue.number}.json`
    : `issue-${issue.owner}-${issue.repo}-${issue.number}.json`;
}

export function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/u, "");
}

export function expandAllowedUrl(url: string): string[] {
  const normalized = normalizeUrl(url);
  const pull = normalized.match(/^(https:\/\/github\.com\/[^/]+\/[^/]+)\/pull\/(\d+)$/u);
  if (pull?.[1] !== undefined && pull[2] !== undefined) {
    return [normalized, `${pull[1]}/issues/${pull[2]}`];
  }
  return [normalized];
}

export function collectFrozenUrls(value: unknown): Set<string> {
  const urls = new Set<string>();
  walk(value, urls);
  return urls;
}

function walk(value: unknown, urls: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      walk(item, urls);
    }
    return;
  }
  if (typeof value !== "object" || value === null) {
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    if (
      (key === "html_url" || key === "url") &&
      typeof item === "string" &&
      /^https?:\/\//u.test(item)
    ) {
      for (const expanded of expandAllowedUrl(item)) {
        urls.add(expanded);
      }
    } else {
      walk(item, urls);
    }
  }
}

export function authedGitUrl(url: string, token: string | undefined): string {
  if (token === undefined || token === "" || !url.startsWith("https://")) {
    return url;
  }
  const parsed = new URL(url);
  parsed.username = "x-access-token";
  parsed.password = token;
  return parsed.toString();
}
