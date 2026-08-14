import { toHunkRef } from "../git/diff.ts";
import { commitsTouching, listCommits, type CommitInfo } from "../git/log.ts";
import { hunkKey } from "../schema/identity.ts";
import type { HunkIndex, HunkRef, ReviewDocument, ReviewGroup, Ticket } from "../schema/types.ts";

export type Kind = "contracts" | "feature" | "tests" | "docs" | "chores";

export type Cluster = {
  id: string;
  kind: Kind;
  title: string;
  hunks: HunkRef[];
};

const CHORE_FILES = new Set([
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "Cargo.lock",
  "go.sum",
  "composer.lock",
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
  ".nvmrc",
  "LICENSE",
  "LICENSE.md",
]);

export async function generateReviewDocument(
  cwd: string,
  index: HunkIndex,
): Promise<ReviewDocument> {
  const clusters = clusterHunks(index.hunks);
  const drafts: { group: ReviewGroup; kind: Kind }[] = [];
  let order = 0;
  for (const cluster of clusters) {
    const paths = unique(
      cluster.hunks.flatMap((hunk) => (hunk.oldPath !== undefined ? [hunk.oldPath, hunk.path] : [hunk.path])),
    );
    const commits = await commitsTouching(cwd, index.source.baseRef, index.source.headRef, paths);
    const brief = briefGroup(cluster, paths, commits);
    const group: ReviewGroup = {
      id: cluster.id,
      title: cluster.title,
      summary: brief.summary,
      suggestedOrder: order,
      hunkRefs: cluster.hunks.map(toHunkRef),
    };
    if (brief.lookFor.length > 0) {
      group.lookFor = brief.lookFor;
    }
    drafts.push({ group, kind: cluster.kind });
    order += 1;
  }
  assignDependsOn(drafts);

  const allCommits = await listCommits(cwd, index.source.baseRef, index.source.headRef);
  const tickets = ticketsFromCommits(allCommits);
  const walkthrough = walkthroughFrom(allCommits);

  const document: ReviewDocument = {
    version: 1,
    source: index.source,
    groups: drafts.map((draft) => draft.group),
  };
  if (walkthrough !== undefined) {
    document.walkthrough = walkthrough;
  }
  if (tickets.length > 0) {
    document.tickets = tickets;
  }
  return document;
}

export function clusterHunks(hunks: HunkRef[]): Cluster[] {
  const buckets = new Map<string, Cluster>();

  const take = (id: string, kind: Kind, title: string): Cluster => {
    const existing = buckets.get(id);
    if (existing !== undefined) {
      return existing;
    }
    const cluster: Cluster = { id, kind, title, hunks: [] };
    buckets.set(id, cluster);
    return cluster;
  };

  for (const hunk of hunks) {
    const kind = classify(hunk.path);
    if (kind === "chores") {
      take("chores", "chores", "Chores and lockfiles").hunks.push(hunk);
      continue;
    }
    if (kind === "docs") {
      take("docs", "docs", "Documentation").hunks.push(hunk);
      continue;
    }
    if (kind === "contracts") {
      take("contracts", "contracts", "Contracts and types").hunks.push(hunk);
      continue;
    }
    if (kind === "tests") {
      const partner = partnerKey(hunk.path);
      const feature = buckets.get(`feature:${partner}`);
      if (feature !== undefined) {
        feature.hunks.push(hunk);
        continue;
      }
      take(`tests:${partner}`, "tests", testTitle(hunk.path)).hunks.push(hunk);
      continue;
    }
    const key = featureKey(hunk.path);
    take(`feature:${key}`, "feature", featureTitle(key)).hunks.push(hunk);
  }

  for (const hunk of hunks) {
    if (classify(hunk.path) !== "tests") {
      continue;
    }
    const partner = partnerKey(hunk.path);
    const tests = buckets.get(`tests:${partner}`);
    const feature = buckets.get(`feature:${partner}`);
    if (tests !== undefined && feature !== undefined) {
      feature.hunks.push(...tests.hunks);
      buckets.delete(`tests:${partner}`);
    }
  }

  const clusters = [...buckets.values()];
  const order = new Map(hunks.map((hunk, index) => [hunkKey(hunk), index]));
  for (const cluster of clusters) {
    cluster.hunks.sort((a, b) => (order.get(hunkKey(a)) ?? 0) - (order.get(hunkKey(b)) ?? 0));
    if (cluster.kind === "feature" && cluster.hunks.some((hunk) => classify(hunk.path) === "tests")) {
      cluster.title = `${cluster.title} and tests`;
    }
  }
  const kindOrder: Kind[] = ["contracts", "feature", "tests", "docs", "chores"];
  clusters.sort((a, b) => {
    const kindDiff = kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind);
    if (kindDiff !== 0) {
      return kindDiff;
    }
    return a.title.localeCompare(b.title);
  });
  return clusters;
}

function classify(path: string): Kind {
  const base = basename(path);
  if (CHORE_FILES.has(base) || /^\.(prettier|eslint|npmrc|yarnrc)/.test(base)) {
    return "chores";
  }
  if (/\.(md|rst|adoc)$/i.test(base) || /(^|\/)docs\//.test(path) || /(^|\/)changelog/i.test(base)) {
    return "docs";
  }
  if (
    /\.d\.ts$/.test(base) ||
    /\.schema\.json$/.test(base) ||
    /(^|\/)(schema|types|contracts|typings)\//.test(path) ||
    /(^|\/)types\.[cm]?[jt]sx?$/.test(path)
  ) {
    return "contracts";
  }
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(base) || /(^|\/)(__tests__|tests?)\//.test(path)) {
    return "tests";
  }
  return "feature";
}

function featureKey(path: string): string {
  const parts = path.split("/").filter((part) => part !== "." && part !== "");
  const stripped = parts.filter((part) => !["src", "lib", "pkg", "packages", "app"].includes(part));
  if (stripped.length >= 2) {
    return stripped[0] ?? stem(path);
  }
  return stem(path);
}

function partnerKey(path: string): string {
  return featureKey(path.replace(/\.(test|spec)\./, "."));
}

function featureTitle(key: string): string {
  const named: Record<string, string> = {
    cli: "CLI",
    ui: "UI",
    git: "Git",
    schema: "Schema",
    server: "Server",
    review: "Review grouping",
    api: "API",
    core: "Core",
  };
  return named[key.toLowerCase()] ?? titleCase(key.replace(/[-_.]/g, " "));
}

function testTitle(path: string): string {
  const key = featureKey(path);
  if (key === "test" || key === "tests") {
    return "Tests";
  }
  return `Tests for ${featureTitle(key)}`;
}

export type GroupBrief = {
  summary: string;
  lookFor: string[];
};

export function briefGroup(cluster: Cluster, paths: string[], commits: CommitInfo[]): GroupBrief {
  const subjects = unique(commits.map((commit) => commit.subject.trim()).filter((subject) => subject.length > 0));
  const summary = subjects[0] ?? fallbackSummary(cluster);
  const lookFor: string[] = [];

  for (const extra of subjects.slice(1, 5)) {
    lookFor.push(extra);
  }

  for (const hunk of cluster.hunks) {
    if (hunk.oldPath !== undefined) {
      lookFor.push(`Rename ${hunk.oldPath} → ${hunk.path}`);
    }
  }

  const added = unique(
    cluster.hunks.filter((hunk) => hunk.oldStart === 0 && hunk.oldLines === 0 && hunk.oldPath === undefined).map((hunk) => hunk.path),
  );
  for (const path of added.slice(0, 4)) {
    lookFor.push(`New file ${path}`);
  }

  const deleted = unique(
    cluster.hunks.filter((hunk) => hunk.newStart === 0 && hunk.newLines === 0).map((hunk) => hunk.path),
  );
  for (const path of deleted.slice(0, 3)) {
    lookFor.push(`Deleted ${path}`);
  }

  const hasTests = paths.some((path) => classify(path) === "tests");
  const hasImpl = paths.some((path) => classify(path) === "feature" || classify(path) === "contracts");
  if (hasTests && hasImpl) {
    lookFor.push("Paired tests are in this layer — check they pin the new behavior.");
  } else if (cluster.kind === "tests") {
    lookFor.push("Read after the implementation layer.");
  } else if (cluster.kind === "contracts") {
    lookFor.push("Foundation: later layers depend on these shapes.");
  } else if (cluster.kind === "chores") {
    lookFor.push("Confirm the manifest matches the code layers, then move on.");
  } else if (cluster.kind === "docs") {
    lookFor.push("Confirm the prose matches what the code layers actually do.");
  }

  return { summary, lookFor: unique(lookFor).slice(0, 8) };
}

export function assignDependsOn(drafts: { group: ReviewGroup; kind: Kind }[]): void {
  const ids = (kind: Kind): string[] => drafts.filter((draft) => draft.kind === kind).map((draft) => draft.group.id);
  const contracts = ids("contracts");
  const features = ids("feature");
  const implementation = [...contracts, ...features];
  for (const draft of drafts) {
    let deps: string[] = [];
    if (draft.kind === "feature") {
      deps = contracts;
    } else if (draft.kind === "tests") {
      deps = implementation;
    } else if (draft.kind === "docs" || draft.kind === "chores") {
      deps = implementation;
    }
    deps = deps.filter((id) => id !== draft.group.id);
    if (deps.length > 0) {
      draft.group.dependsOn = deps;
    }
  }
}

function fallbackSummary(cluster: Cluster): string {
  switch (cluster.kind) {
    case "contracts":
      return "Types and contracts that later layers consume.";
    case "tests":
      return "Tests for the behavior in earlier layers.";
    case "docs":
      return "Documentation for this change.";
    case "chores":
      return "Manifest and lockfile updates.";
    default:
      return `${cluster.title} implementation.`;
  }
}

function walkthroughFrom(commits: CommitInfo[]): string | undefined {
  const subjects = unique(commits.map((commit) => commit.subject.trim()).filter((subject) => subject.length > 0)).slice(
    0,
    2,
  );
  if (subjects.length === 0) {
    return undefined;
  }
  return subjects.join(" · ");
}

function ticketsFromCommits(commits: CommitInfo[]): Ticket[] {
  const seen = new Set<string>();
  const tickets: Ticket[] = [];
  const pattern = /#(\d+)/g;
  for (const commit of commits) {
    for (const match of commit.subject.matchAll(pattern)) {
      const id = match[1];
      if (id === undefined || seen.has(id)) {
        continue;
      }
      seen.add(id);
      tickets.push({ id: `#${id}` });
    }
  }
  return tickets;
}

function basename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

function stem(path: string): string {
  return basename(path).replace(/\.(test|spec)\./, ".").replace(/\.[^.]+$/, "");
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
