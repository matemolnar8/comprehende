import { filesFromPayload } from "./layer-files.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("filesFromPayload", () => {
  it("keeps lockfile line counts from the payload when hunks have no lines", () => {
    const files = filesFromPayload([
      {
        path: "package-lock.json",
        kind: "lockfile",
        patch: "",
        added: 12,
        removed: 4,
        hunks: [
          {
            path: "package-lock.json",
            oldStart: 0,
            oldLines: 0,
            newStart: 0,
            newLines: 0,
            header: "lockfile",
            language: "json",
            lines: [],
          },
        ],
      },
    ]);
    assert.equal(files[0]?.kind, "lockfile");
    assert.equal(files[0]?.added, 12);
    assert.equal(files[0]?.removed, 4);
    assert.equal(files[0]?.hunkCount, 1);
  });
});
