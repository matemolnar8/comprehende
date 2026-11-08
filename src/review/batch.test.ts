import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { parseUnifiedDiff } from "../git/diff.ts";
import { formatBatch, formatReadLine, readingPlan } from "./batch.ts";

/** One modified file whose hunks each add `lines` lines of `width` characters. */
function edited(path: string, hunks: number, lines = 1, width = 10): string {
  const body = Array.from({ length: hunks }, (_, h) => {
    const start = h * 100 + 1;
    const added = Array.from(
      { length: lines },
      (_, i) => `+${`${path}:${h}:${i} `.padEnd(width, "x")}`,
    );
    return [`@@ -${start},1 +${start},${lines + 1} @@`, " keep", ...added].join("\n");
  });
  return [`diff --git a/${path} b/${path}`, `--- a/${path}`, `+++ b/${path}`, ...body].join("\n");
}

function diff(...files: string[]): string {
  return `${files.join("\n")}\n`;
}

const sameChange = (path: string): string =>
  [
    `diff --git a/${path} b/${path}`,
    `--- a/${path}`,
    `+++ b/${path}`,
    "@@ -1 +1 @@",
    "-old()",
    "+next()",
  ].join("\n");

describe("readingPlan", () => {
  it("reads code and skips what reading cannot change, in digest order", () => {
    const plan = readingPlan(
      parseUnifiedDiff(
        diff(
          "diff --git a/old.ts b/kept.ts\nsimilarity index 100%\nrename from old.ts\nrename to kept.ts",
          edited("src/a.ts", 1),
          sameChange("src/b.ts"),
          sameChange("src/c.ts"),
          edited("dist/app.js", 1),
          edited("package-lock.json", 1),
          "diff --git a/blob.bin b/blob.bin\nBinary files a/blob.bin and b/blob.bin differ",
        ),
      ),
    );
    assert.deepEqual(
      plan.read.map((item) => item.file.path),
      ["src/a.ts", "src/b.ts"],
    );
    assert.deepEqual(
      plan.skipped.map((item) => item.path),
      ["kept.ts", "src/c.ts", "dist/app.js", "package-lock.json", "blob.bin"],
    );
    assert.equal(plan.changedLines, 3);
    assert.equal(plan.size.size, "trivial");
    assert.equal(
      formatReadLine(plan),
      "read: show --batch 1 · 3 changed lines in 2 files · 5 files skipped",
    );
    const text = formatBatch(plan, 1);
    assert.match(text, /^# Batch 1 of 1 · 2 files · 3 changed lines\n# Skipped 5 files/);
    assert.match(text, /^# {3}src\/c\.ts · same change as src\/b\.ts$/m);
    assert.match(text, /^# {3}kept\.ts · rename \+0\/-0$/m);
    assert.match(text, /# Last batch$/);
    assert.doesNotMatch(text, /dist\/app\.js:0/);
  });

  it("keeps a file whole when it fits, splits a bigger one at hunks, and prints a huge hunk alone", () => {
    const budget = 2_000;
    const plan = readingPlan(
      parseUnifiedDiff(
        diff(
          edited("small.ts", 1, 5),
          edited("medium.ts", 2, 20),
          edited("big.ts", 6, 15, 30),
          edited("huge.ts", 1, 80, 40),
        ),
      ),
      budget,
    );
    const batches = plan.batches.map((_, i) => formatBatch(plan, i + 1));
    assert.ok(batches.length > 3);
    const holding = (path: string): number[] =>
      batches.flatMap((text, i) => (text.includes(`diff --git a/${path} `) ? [i + 1] : []));
    assert.equal(holding("medium.ts").length, 1, "a file that fits the budget is not split");
    assert.ok(holding("big.ts").length > 1, "a file over the budget splits");
    const parts = batches.join("\n").match(/^# big\.ts · hunks \d+-\d+ of 6$/gm) ?? [];
    assert.equal(parts.length, holding("big.ts").length);
    const [huge] = holding("huge.ts");
    assert.ok(huge !== undefined);
    assert.match(batches[huge - 1] ?? "", /^# Batch \d+ of \d+ · 1 file · 80 changed lines/);
    for (const [i, text] of batches.entries()) {
      if (i + 1 !== huge) {
        assert.ok(text.length <= budget + 100, `batch ${i + 1} is ${text.length} characters`);
      }
    }
    assert.match(batches[0] ?? "", /# Next: show --batch 2$/);
    assert.throws(
      () => formatBatch(plan, batches.length + 1),
      new RegExp(`has ${batches.length} batches \\(show --batch 1\\.\\.${batches.length}\\)`),
    );
  });

  it("gives batch 1 a count per reason when many files are skipped", () => {
    const renames = Array.from(
      { length: 25 },
      (_, i) =>
        `diff --git a/old/${i}.ts b/new/${i}.ts\nsimilarity index 100%\nrename from old/${i}.ts\nrename to new/${i}.ts`,
    );
    const plan = readingPlan(parseUnifiedDiff(diff(...renames, edited("dist/a.js", 1))));
    assert.equal(plan.read.length, 0);
    assert.equal(
      formatBatch(plan, 1),
      [
        "# Batch 1 of 1 · 0 files · 0 changed lines",
        "# Skipped 26 files; show --file <path> reads one. The digest names them: 25 rename +0/-0, 1 generated",
        "# Last batch",
      ].join("\n"),
    );
  });
});
