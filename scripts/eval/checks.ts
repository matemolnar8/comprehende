import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { git, gitOk } from "../../src/git/exec.ts";
import type { ReviewDocument, ReviewGroup, Source } from "../../src/schema/types.ts";
import type { EvalExpect } from "./case.ts";
import { collectFrozenUrls, normalizeUrl } from "./github.ts";

export type CheckFailure = {
  check: string;
  message: string;
};

export type DeterministicReport = {
  failures: CheckFailure[];
  dirtyWorktree: boolean;
  why: "present" | "absent";
  parts: number;
  size: ReviewDocument["size"];
  togetherOk: number;
  togetherTotal: number;
  apartOk: number;
  apartTotal: number;
};

const EM_DASH = /[\u2013\u2014]/u;

export async function worktreeDirty(cwd: string): Promise<boolean> {
  const status = (await git(cwd, ["status", "--porcelain"])).trim();
  return status !== "";
}

export async function loadFrozenSourceValues(sourcesDir: string): Promise<unknown[]> {
  const names = await readdir(sourcesDir);
  const values: unknown[] = [];
  for (const name of names.sort((a, b) => a.localeCompare(b))) {
    if (!name.endsWith(".json")) {
      continue;
    }
    values.push(JSON.parse(await readFile(join(sourcesDir, name), "utf8")));
  }
  return values;
}

export async function runDeterministicChecks(opts: {
  cwd: string;
  document: ReviewDocument;
  expect?: EvalExpect;
  frozen: unknown[];
}): Promise<DeterministicReport> {
  const failures: CheckFailure[] = [];
  const dirtyWorktree = await worktreeDirty(opts.cwd);
  if (dirtyWorktree) {
    failures.push({ check: "worktree", message: "producer left the work tree dirty" });
  }

  const why: "present" | "absent" = opts.document.why !== undefined && opts.document.why.trim() !== "" ? "present" : "absent";
  const parts = distinctParts(opts.document.groups);
  const size = opts.document.size;
  const expect = opts.expect ?? {};

  if (expect.why !== undefined && expect.why !== why) {
    failures.push({ check: "why", message: `expected why ${expect.why}, got ${why}` });
  }
  if (expect.parts !== undefined) {
    if (expect.parts.max < expect.parts.min) {
      failures.push({ check: "parts", message: `parts.max ${expect.parts.max} is below min ${expect.parts.min}` });
    } else if (parts < expect.parts.min || parts > expect.parts.max) {
      failures.push({
        check: "parts",
        message: `expected ${expect.parts.min} to ${expect.parts.max} parts, got ${parts}`,
      });
    }
  }
  if (expect.size !== undefined && !expect.size.includes(size)) {
    failures.push({ check: "size", message: `expected size ${expect.size.join("|")}, got ${size}` });
  }
  if (expect.sourceKinds !== undefined) {
    const kinds = new Set((opts.document.sources ?? []).map((source) => source.kind));
    const missing = expect.sourceKinds.filter((kind) => !kinds.has(kind));
    if (missing.length > 0) {
      failures.push({ check: "sourceKinds", message: `missing source kinds: ${missing.join(", ")}` });
    }
  }

  const allowed = new Set<string>();
  for (const value of opts.frozen) {
    for (const url of collectFrozenUrls(value)) {
      allowed.add(url);
    }
  }
  for (const source of opts.document.sources ?? []) {
    failures.push(...sourceFailures(source, allowed));
  }
  failures.push(...(await commitSourceFailures(opts.cwd, opts.document)));

  const together = expect.together ?? [];
  let togetherOk = 0;
  for (const paths of together) {
    if (someGroupCovers(opts.document.groups, paths)) {
      togetherOk += 1;
    } else {
      failures.push({ check: "together", message: `no group holds ${paths.join(", ")} together` });
    }
  }

  const apart = expect.apart ?? [];
  let apartOk = 0;
  for (const pair of apart) {
    if (someGroupCovers(opts.document.groups, pair)) {
      failures.push({ check: "apart", message: `a group holds both ${pair[0]} and ${pair[1]}` });
    } else {
      apartOk += 1;
    }
  }

  if (expect.mechanicalPaths !== undefined && !someGroupCovers(opts.document.groups, expect.mechanicalPaths)) {
    failures.push({
      check: "mechanical",
      message: `no one group holds mechanical paths ${expect.mechanicalPaths.join(", ")}`,
    });
  }

  for (const lint of proseLints(opts.document)) {
    failures.push({ check: "proseLint", message: lint });
  }

  return {
    failures,
    dirtyWorktree,
    why,
    parts,
    size,
    togetherOk,
    togetherTotal: together.length,
    apartOk,
    apartTotal: apart.length,
  };
}

function distinctParts(groups: ReviewGroup[]): number {
  return new Set(groups.map((group) => group.part).filter((part) => part !== undefined)).size;
}

function groupPaths(group: ReviewGroup): Set<string> {
  const paths = new Set<string>();
  for (const hunk of group.hunkRefs) {
    paths.add(hunk.path);
    if (hunk.oldPath !== undefined) {
      paths.add(hunk.oldPath);
    }
  }
  return paths;
}

function someGroupCovers(groups: ReviewGroup[], paths: readonly string[]): boolean {
  return groups.some((group) => {
    const held = groupPaths(group);
    return paths.every((path) => held.has(path));
  });
}

function sourceFailures(source: Source, allowed: Set<string>): CheckFailure[] {
  if (source.kind === "transcript") {
    return [{ check: "sources", message: `transcript source "${source.id}" is invented in this harness` }];
  }
  if (source.url === undefined) {
    return [];
  }
  if (!allowed.has(normalizeUrl(source.url))) {
    return [{ check: "sources", message: `source "${source.id}" url is not in the frozen set: ${source.url}` }];
  }
  return [];
}

async function commitSourceFailures(cwd: string, document: ReviewDocument): Promise<CheckFailure[]> {
  const commits = (document.sources ?? []).filter((source) => source.kind === "commit");
  if (commits.length === 0) {
    return [];
  }
  const range = `${document.source.baseRef}...${document.source.headRef}`;
  const shas = (await git(cwd, ["log", "--format=%H", "--end-of-options", range])).trim().split("\n").filter(Boolean);
  const subjects = (await git(cwd, ["log", "--format=%s", "--end-of-options", range])).trim().split("\n");
  const shaSet = new Set(shas);
  const subjectSet = new Set(subjects);
  const failures: CheckFailure[] = [];
  for (const source of commits) {
    if (subjectSet.has(source.label) || shas.some((sha) => sha.startsWith(source.label) || source.label.startsWith(sha.slice(0, 7)))) {
      continue;
    }
    const exists = await gitOk(cwd, ["cat-file", "-e", `${source.label}^{commit}`]);
    if (exists) {
      const resolved = (await git(cwd, ["rev-parse", "--verify", `${source.label}^{commit}`])).trim();
      if (shaSet.has(resolved)) {
        continue;
      }
    }
    failures.push({ check: "sources", message: `commit source "${source.id}" label is not in ${range}: ${source.label}` });
  }
  return failures;
}

export function proseLints(document: ReviewDocument): string[] {
  const lints: string[] = [];
  for (const field of documentFields(document)) {
    if (EM_DASH.test(field.text)) {
      lints.push(`${field.where} contains an em dash or en dash`);
    }
    for (const sentence of sentences(field.text)) {
      const words = wordCount(sentence);
      if (words > 25) {
        lints.push(`${field.where} has a ${words}-word sentence`);
      }
    }
  }
  return lints;
}

function documentFields(document: ReviewDocument): { where: string; text: string }[] {
  const fields: { where: string; text: string }[] = [
    { where: "title", text: document.title },
    { where: "summary", text: document.summary },
  ];
  if (document.why !== undefined) {
    fields.push({ where: "why", text: document.why });
  }
  for (const bullet of document.lookFor ?? []) {
    fields.push({ where: "document lookFor", text: bullet });
  }
  for (const group of document.groups) {
    fields.push({ where: `group ${group.id} title`, text: group.title });
    fields.push({ where: `group ${group.id} why`, text: group.why });
    fields.push({ where: `group ${group.id} summary`, text: group.summary });
    for (const bullet of group.lookFor ?? []) {
      fields.push({ where: `group ${group.id} lookFor`, text: bullet });
    }
  }
  return fields;
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/u)
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

function wordCount(text: string): number {
  return text.split(/\s+/u).filter((item) => item !== "").length;
}
