export type GithubRepo = { owner: string; repo: string };

const PR_URL = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/.*)?$/u;

export function parseGithubPrUrl(url: string): GithubRepo & { pr: number } {
  const match = url.trim().match(PR_URL);
  if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
    throw new Error(`not a GitHub pull request URL: ${url}`);
  }
  return { owner: match[1], repo: match[2], pr: Number(match[3]) };
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

export function linkedIssueNumbers(text: string): number[] {
  const found = new Set<number>();
  const close = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/giu;
  for (const match of text.matchAll(close)) {
    const raw = match[1];
    if (raw !== undefined) {
      found.add(Number(raw));
    }
  }
  const full = /https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/(\d+)/giu;
  for (const match of text.matchAll(full)) {
    const raw = match[1];
    if (raw !== undefined) {
      found.add(Number(raw));
    }
  }
  return [...found].sort((a, b) => a - b);
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
    if ((key === "html_url" || key === "url") && typeof item === "string" && /^https?:\/\//u.test(item)) {
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
