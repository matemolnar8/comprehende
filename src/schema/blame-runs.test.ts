import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { groupBlameRuns } from "./blame-runs.ts";

describe("groupBlameRuns", () => {
  it("collapses consecutive lines from the same commit", () => {
    const runs = groupBlameRuns([
      { sha: "aaa", author: "Ada", timestamp: 1, summary: "Add a", line: 1 },
      { sha: "aaa", author: "Ada", timestamp: 1, summary: "Add a", line: 2 },
      { sha: "bbb", author: "Ben", timestamp: 2, summary: "Fix b", line: 3 },
      { sha: "aaa", author: "Ada", timestamp: 1, summary: "Add a", line: 4 },
    ]);
    assert.deepEqual(runs, [
      { lineNumber: 1, sha: "aaa", author: "Ada", timestamp: 1, summary: "Add a", lines: 2 },
      { lineNumber: 3, sha: "bbb", author: "Ben", timestamp: 2, summary: "Fix b", lines: 1 },
      { lineNumber: 4, sha: "aaa", author: "Ada", timestamp: 1, summary: "Add a", lines: 1 },
    ]);
  });
});
