import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatStoredHunkRef, parseHunkRefString } from "./identity.ts";

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

  it("formats a stored ref the way it was written", () => {
    assert.equal(formatStoredHunkRef({ path: "src/app.ts" }), "src/app.ts");
    assert.equal(formatStoredHunkRef({ path: "src/app.ts", oldStart: 1, newStart: 10 }), "src/app.ts@1+10");
    assert.equal(
      formatStoredHunkRef({ path: "src/helpers.ts", oldPath: "src/util.ts", oldStart: 4, newStart: 4 }),
      "src/util.ts -> src/helpers.ts@4+4",
    );
    assert.equal(
      formatStoredHunkRef({ path: "src/app.ts", oldStart: 1, oldLines: 3, newStart: 1, newLines: 8 }),
      "src/app.ts @@ -1,3 +1,8 @@",
    );
  });
});
