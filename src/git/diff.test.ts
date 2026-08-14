import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseUnifiedDiff } from "./diff.ts";

const SAMPLE = `diff --git a/src/app.ts b/src/app.ts
index 111..222 100644
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,3 +1,4 @@
 export const name = "app";
+export const extra = true;
 export function start() {
   return name;
@@ -20,3 +21,4 @@ export function end() {
   return "end";
 }
+export const tail = 1;
diff --git a/src/util.ts b/src/helpers.ts
similarity index 80%
rename from src/util.ts
rename to src/helpers.ts
index 111..222 100644
--- a/src/util.ts
+++ b/src/helpers.ts
@@ -1,3 +1,3 @@
-export const label = "util";
+export const label = "helpers";
 export function help() {
   return 1;
diff --git a/assets/dot.bin b/assets/dot.bin
index 111..222 100644
Binary files a/assets/dot.bin and b/assets/dot.bin differ
`;

describe("parseUnifiedDiff", () => {
  it("parses multi-hunk files, renames, and skips binaries", () => {
    const files = parseUnifiedDiff(SAMPLE);
    assert.equal(files.length, 3);

    const app = files[0];
    assert.ok(app);
    assert.equal(app.path, "src/app.ts");
    assert.equal(app.hunks.length, 2);
    assert.equal(app.hunks[0]?.oldStart, 1);
    assert.equal(app.hunks[0]?.newStart, 1);
    assert.equal(app.hunks[1]?.oldStart, 20);
    assert.equal(app.hunks[0]?.lines.some((line) => line.kind === "add" && line.text.includes("extra")), true);

    const renamed = files[1];
    assert.ok(renamed);
    assert.equal(renamed.status, "renamed");
    assert.equal(renamed.oldPath, "src/util.ts");
    assert.equal(renamed.path, "src/helpers.ts");
    assert.equal(renamed.hunks[0]?.oldPath, "src/util.ts");

    const binary = files[2];
    assert.ok(binary);
    assert.equal(binary.binary, true);
    assert.equal(binary.hunks.length, 0);
  });
});
