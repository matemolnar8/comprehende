import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clusterHunks } from "./generate.ts";
import type { HunkRef } from "../schema/types.ts";

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
});
