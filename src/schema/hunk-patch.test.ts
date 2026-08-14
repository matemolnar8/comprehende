import { parsePatchFiles } from "@pierre/diffs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseUnifiedDiff } from "../git/diff.ts";
import { hunksToUnifiedPatch } from "./hunk-patch.ts";
import type { LiveHunk } from "./types.ts";

const changed: LiveHunk = {
  path: "src/app.ts",
  oldStart: 1,
  oldLines: 3,
  newStart: 1,
  newLines: 4,
  header: "@@ -1,3 +1,4 @@",
  lines: [
    { kind: "ctx", oldNumber: 1, newNumber: 1, text: 'export const name = "app";' },
    { kind: "add", oldNumber: null, newNumber: 2, text: "export const extra = true;" },
    { kind: "ctx", oldNumber: 2, newNumber: 3, text: "export function start() {" },
    { kind: "ctx", oldNumber: 3, newNumber: 4, text: "  return name;" },
  ],
};

describe("hunksToUnifiedPatch", () => {
  it("round-trips live hunks back into a git-parseable patch", () => {
    const files = parseUnifiedDiff(hunksToUnifiedPatch([changed]));
    assert.equal(files.length, 1);
    assert.equal(files[0]?.path, "src/app.ts");
    assert.equal(files[0]?.hunks[0]?.lines[1]?.kind, "add");
    assert.equal(files[0]?.hunks[0]?.lines[1]?.text, "export const extra = true;");
  });

  it("reconstructs added and deleted files", () => {
    const added: LiveHunk = {
      path: "src/new.ts",
      oldStart: 0,
      oldLines: 0,
      newStart: 1,
      newLines: 1,
      header: "@@ -0,0 +1 @@",
      lines: [{ kind: "add", oldNumber: null, newNumber: 1, text: "export const ok = true;" }],
    };
    const deleted: LiveHunk = {
      path: "src/gone.ts",
      oldStart: 1,
      oldLines: 1,
      newStart: 0,
      newLines: 0,
      header: "@@ -1 +0,0 @@",
      lines: [{ kind: "del", oldNumber: 1, newNumber: null, text: "export const gone = true;" }],
    };
    const files = parseUnifiedDiff(hunksToUnifiedPatch([added, deleted]));
    assert.equal(files[0]?.status, "added");
    assert.equal(files[1]?.status, "deleted");
  });

  it("is parseable by Pierre, the same renderer T3 Code uses", () => {
    const parsed = parsePatchFiles(hunksToUnifiedPatch([changed]), "test");
    assert.equal(parsed[0]?.files[0]?.name, "src/app.ts");
    assert.equal(parsed[0]?.files[0]?.hunks[0]?.additionLines, 1);
  });
});
