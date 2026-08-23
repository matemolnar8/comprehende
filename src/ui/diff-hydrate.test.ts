import { hydratePartialDiff, parsePatchFiles } from "@pierre/diffs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXPANSION_LINE_COUNT } from "./lib/gap-style.ts";

const PAD = Array.from({ length: 40 }, (_, i) => `const pad${i} = ${i};`);

const OLD = ["const head = 1;", 'const a = "old";', ...PAD, 'const b = "old";', "const tail = 1;"].join("\n");
const NEXT = ["const head = 1;", 'const a = "new";', ...PAD, 'const b = "new";', "const tail = 1;"].join("\n");

const PATCH = `diff --git a/gap.ts b/gap.ts
--- a/gap.ts
+++ b/gap.ts
@@ -1,5 +1,5 @@
 const head = 1;
-const a = "old";
+const a = "new";
 const pad0 = 0;
 const pad1 = 1;
 const pad2 = 2;
@@ -40,5 +40,5 @@
 const pad37 = 37;
 const pad38 = 38;
 const pad39 = 39;
-const b = "old";
+const b = "new";
 const tail = 1;
`;

describe("partial patch hydration", () => {
  it("keeps the grouped hunks and fills the gap from full file contents", () => {
    const parsed = parsePatchFiles(PATCH, "gap-test")[0]?.files[0];
    assert.ok(parsed);
    assert.equal(parsed.isPartial, true);
    assert.equal(parsed.hunks.length, 2);
    const collapsed = parsed.hunks[1]?.collapsedBefore ?? 0;
    assert.ok(collapsed > EXPANSION_LINE_COUNT);

    const hydrated = hydratePartialDiff("clone", parsed, {
      oldFile: { name: "gap.ts", contents: OLD, cacheKey: "old" },
      newFile: { name: "gap.ts", contents: NEXT, cacheKey: "new" },
    });
    assert.equal(hydrated.isPartial, false);
    assert.equal(hydrated.hunks.length, 2);
    assert.equal(hydrated.hunks[1]?.collapsedBefore, collapsed);
    assert.equal(hydrated.additionLines.some((line) => line.includes('const a = "new"')), true);
    assert.equal(hydrated.additionLines.some((line) => line.includes("const pad20 = 20")), true);
    assert.equal(hydrated.deletionLines.some((line) => line.includes('const b = "old"')), true);
    assert.ok(hydrated.additionLines.length > 40);
  });
});
