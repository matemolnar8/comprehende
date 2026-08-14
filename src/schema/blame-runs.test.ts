import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { groupBlameRuns } from "./blame-runs.ts";

describe("groupBlameRuns", () => {
  it("collapses consecutive lines from the same commit", () => {
    const runs = groupBlameRuns([
      { sha: "aaa", author: "Ada", timestamp: 1, line: 1 },
      { sha: "aaa", author: "Ada", timestamp: 1, line: 2 },
      { sha: "bbb", author: "Ben", timestamp: 2, line: 3 },
      { sha: "aaa", author: "Ada", timestamp: 1, line: 4 },
    ]);
    assert.deepEqual(runs, [
      { lineNumber: 1, sha: "aaa", author: "Ada", timestamp: 1, lines: 2 },
      { lineNumber: 3, sha: "bbb", author: "Ben", timestamp: 2, lines: 1 },
      { lineNumber: 4, sha: "aaa", author: "Ada", timestamp: 1, lines: 1 },
    ]);
  });
});
