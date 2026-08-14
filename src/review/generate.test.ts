import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assignDependsOn, briefGroup, clusterHunks, type Cluster } from "./generate.ts";
import type { HunkRef, ReviewGroup } from "../schema/types.ts";

function ref(path: string, oldPath?: string): HunkRef {
  const hunk: HunkRef = { path, oldStart: 1, oldLines: 1, newStart: 1, newLines: 2 };
  if (oldPath !== undefined) {
    hunk.oldPath = oldPath;
  }
  return hunk;
}

describe("clusterHunks", () => {
  it("groups by concern: contracts, features (with paired tests), docs, chores", () => {
    const clusters = clusterHunks([
      ref("src/schema/types.ts"),
      ref("src/cli/main.ts"),
      ref("src/cli/main.test.ts"),
      ref("src/types.ts"),
      ref("package.json"),
      ref("README.md"),
      ref("pnpm-lock.yaml"),
    ]);
    const ids = clusters.map((cluster) => cluster.id);
    assert.deepEqual(ids, ["contracts", "feature:cli", "docs", "chores"]);
    const cli = clusters.find((cluster) => cluster.id === "feature:cli");
    assert.equal(cli?.hunks.length, 2);
    assert.equal(cli?.title.endsWith("and tests"), true);
  });

  it("writes a one-line summary and lookFor bullets, not a dense paragraph", () => {
    const cluster: Cluster = {
      id: "feature:cli",
      kind: "feature",
      title: "CLI and tests",
      hunks: [ref("src/cli/main.ts"), ref("src/cli/main.test.ts")],
    };
    const brief = briefGroup(cluster, ["src/cli/main.ts", "src/cli/main.test.ts"], [
      { sha: "a", shortSha: "a", subject: "Add the generate command", author: "x", date: "2026-01-01" },
      { sha: "b", shortSha: "b", subject: "Cover generate with a fixture", author: "x", date: "2026-01-01" },
    ]);
    assert.equal(brief.summary, "Add the generate command");
    assert.equal(brief.summary.includes("hunks across"), false);
    assert.ok(brief.lookFor.includes("Cover generate with a fixture"));
    assert.ok(brief.lookFor.some((item) => item.includes("Paired tests")));
  });

  it("stacks later layers on contracts and features", () => {
    const drafts: { kind: "contracts" | "feature" | "tests"; group: ReviewGroup }[] = [
      { kind: "contracts", group: { id: "contracts", title: "C", summary: "", suggestedOrder: 0, hunkRefs: [] } },
      { kind: "feature", group: { id: "cli", title: "CLI", summary: "", suggestedOrder: 1, hunkRefs: [] } },
      { kind: "tests", group: { id: "tests", title: "Tests", summary: "", suggestedOrder: 2, hunkRefs: [] } },
    ];
    assignDependsOn(drafts);
    assert.deepEqual(drafts[1]?.group.dependsOn, ["contracts"]);
    assert.deepEqual(drafts[2]?.group.dependsOn, ["contracts", "cli"]);
  });
});
