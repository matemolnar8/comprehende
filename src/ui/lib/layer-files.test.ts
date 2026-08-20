import { filesFromPayload, fileIndexAtHunk } from "./layer-files.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("filesFromPayload", () => {
  it("keeps lockfile line counts and gives a file with no hunks one navigation slot", () => {
    const files = filesFromPayload([
      {
        path: "package-lock.json",
        kind: "lockfile",
        patch: "",
        added: 12,
        removed: 4,
        hunks: [],
      },
    ]);
    assert.equal(files[0]?.kind, "lockfile");
    assert.equal(files[0]?.added, 12);
    assert.equal(files[0]?.removed, 4);
    assert.equal(files[0]?.hunkCount, 1);
    assert.equal(fileIndexAtHunk(files, 0), 0);
  });
});
