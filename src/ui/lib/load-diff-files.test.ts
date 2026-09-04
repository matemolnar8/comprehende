import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ApiFile } from "../../api/types.ts";
import { canHydrateDiff, loadDiffFilesWith, splitHasTwoSides, toPierreFile } from "./load-diff-files.ts";

function apiFile(side: "old" | "new", path: string, content: string): ApiFile {
  return { path, ref: `${side}-sha`, side, content, language: "typescript" };
}

describe("load diff files", () => {
  it("keys Pierre file cache by side, ref, and path", () => {
    const file = toPierreFile(apiFile("new", "src/app.ts", "export const n = 1;\n"));
    assert.equal(file.name, "src/app.ts");
    assert.equal(file.contents, "export const n = 1;\n");
    assert.equal(file.cacheKey, toPierreFile(apiFile("new", "src/app.ts", "export const n = 1;\n")).cacheKey);
    assert.notEqual(file.cacheKey, toPierreFile(apiFile("old", "src/app.ts", "export const n = 1;\n")).cacheKey);
    assert.notEqual(file.cacheKey, toPierreFile(apiFile("new", "src/other.ts", "export const n = 1;\n")).cacheKey);
    assert.notEqual(
      file.cacheKey,
      toPierreFile({ path: "src/app.ts", ref: "other-sha", side: "new", content: "export const n = 1;\n", language: "typescript" }).cacheKey,
    );
  });

  it("loads both sides for a changed file", async () => {
    const calls: string[] = [];
    const loaded = await loadDiffFilesWith({ name: "src/app.ts", type: "change" }, async (path, side) => {
      calls.push(`${side}:${path}`);
      return apiFile(side, path, `${side} body`);
    });
    assert.deepEqual(calls.sort(), ["new:src/app.ts", "old:src/app.ts"]);
    assert.equal(loaded.oldFile?.contents, "old body");
    assert.equal(loaded.newFile.contents, "new body");
  });

  it("hydrates partial change and rename diffs, not added files", () => {
    assert.equal(canHydrateDiff({ isPartial: true, type: "change" }), true);
    assert.equal(canHydrateDiff({ isPartial: true, type: "rename-changed" }), true);
    assert.equal(canHydrateDiff({ isPartial: true, type: "rename-pure" }), true);
    assert.equal(canHydrateDiff({ isPartial: false, type: "change" }), false);
    assert.equal(canHydrateDiff({ isPartial: true, type: "new" }), false);
  });

  it("treats added and deleted files as one split pane", () => {
    assert.equal(splitHasTwoSides("change"), true);
    assert.equal(splitHasTwoSides("rename-changed"), true);
    assert.equal(splitHasTwoSides("rename-pure"), true);
    assert.equal(splitHasTwoSides("new"), false);
    assert.equal(splitHasTwoSides("deleted"), false);
  });

  it("loads only the new side for a pure rename", async () => {
    const calls: string[] = [];
    const loaded = await loadDiffFilesWith({ name: "src/helpers.ts", type: "rename-pure" }, async (path, side) => {
      calls.push(`${side}:${path}`);
      return apiFile(side, path, "renamed");
    });
    assert.deepEqual(calls, ["new:src/helpers.ts"]);
    assert.equal(loaded.oldFile, null);
    assert.equal(loaded.newFile.contents, "renamed");
  });
});
