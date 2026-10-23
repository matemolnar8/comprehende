import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import {
  formatStoredHunkRef,
  groupsHoldingPath,
  parseHunkRefString,
  refCoversPath,
} from "./identity.ts";

describe("parseHunkRefString", () => {
  it("reads a path, one hunk, and a rename", () => {
    assert.deepEqual(parseHunkRefString("src/app.ts"), { kind: "file", path: "src/app.ts" });
    assert.deepEqual(parseHunkRefString("  src/app.ts  "), { kind: "file", path: "src/app.ts" });
    assert.deepEqual(parseHunkRefString("foo@bar.ts"), { kind: "file", path: "foo@bar.ts" });
    assert.deepEqual(parseHunkRefString("src/app.ts@1+10"), {
      kind: "hunk",
      path: "src/app.ts",
      oldStart: 1,
      newStart: 10,
    });
    assert.deepEqual(parseHunkRefString("foo@bar.ts@3+4"), {
      kind: "hunk",
      path: "foo@bar.ts",
      oldStart: 3,
      newStart: 4,
    });
    assert.deepEqual(parseHunkRefString("src/util.ts -> src/helpers.ts@4+4"), {
      kind: "hunk",
      path: "src/helpers.ts",
      oldPath: "src/util.ts",
      oldStart: 4,
      newStart: 4,
    });
    assert.deepEqual(parseHunkRefString("old@x.ts -> new@y.ts@0+0"), {
      kind: "hunk",
      path: "new@y.ts",
      oldPath: "old@x.ts",
      oldStart: 0,
      newStart: 0,
    });
    assert.equal(parseHunkRefString("@1+2"), undefined);
    assert.equal(parseHunkRefString("src/a.ts -> @1+2"), undefined);
    assert.equal(parseHunkRefString(""), undefined);
  });

  it("reads a directory ref and covers the paths under it", () => {
    assert.deepEqual(parseHunkRefString("e2e/snapshots/"), { kind: "dir", dir: "e2e/snapshots/" });
    assert.equal(parseHunkRefString("/"), undefined);
    assert.equal(formatStoredHunkRef({ dir: "e2e/snapshots/" }), "e2e/snapshots/");
    assert.equal(refCoversPath({ dir: "e2e/snapshots/" }, "e2e/snapshots/linux/a.png"), true);
    assert.equal(refCoversPath({ dir: "e2e/snapshots/" }, "e2e/snapshots-old/a.png"), false);
    assert.equal(
      refCoversPath({ path: "b.ts", oldPath: "a.ts", oldStart: 1, newStart: 1 }, "a.ts"),
      true,
    );
  });

  it("gives a path to the group that names it, else to the deepest directory ref", () => {
    const story = { id: "story", hunkRefs: [{ path: "e2e/linux/a.png" }] };
    const outer = { id: "outer", hunkRefs: [{ dir: "e2e/" }] };
    const inner = { id: "inner", hunkRefs: [{ dir: "e2e/linux/" }] };
    const groups = [story, outer, inner];
    assert.deepEqual(groupsHoldingPath(groups, "e2e/linux/a.png"), [story]);
    assert.deepEqual(groupsHoldingPath(groups, "e2e/linux/b.png"), [inner]);
    assert.deepEqual(groupsHoldingPath(groups, "e2e/mac/b.png"), [outer]);
    assert.deepEqual(groupsHoldingPath(groups, "src/app.ts"), []);
  });

  it("formats a stored ref the way it was written", () => {
    assert.equal(formatStoredHunkRef({ path: "src/app.ts" }), "src/app.ts");
    assert.equal(
      formatStoredHunkRef({ path: "src/app.ts", oldStart: 1, newStart: 10 }),
      "src/app.ts@1+10",
    );
    assert.equal(
      formatStoredHunkRef({
        path: "src/helpers.ts",
        oldPath: "src/util.ts",
        oldStart: 4,
        newStart: 4,
      }),
      "src/util.ts -> src/helpers.ts@4+4",
    );
  });
});
