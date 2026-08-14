import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseReviewDocument } from "./parse.ts";
import { addedSymbols, hunkContext, hunkRangeLabel, splitDiffRows, type HunkLine } from "./hunk-meta.ts";

describe("parseReviewDocument", () => {
  it("accepts a minimal valid document", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      walkthrough: "Split the review document from live git.",
      groups: [
        {
          id: "g1",
          title: "CLI",
          summary: "Adds a command.",
          lookFor: ["Check the flag parsing."],
          suggestedOrder: 0,
          hunkRefs: [
            { path: "src/cli/main.ts", oldStart: 1, oldLines: 3, newStart: 1, newLines: 8 },
          ],
        },
      ],
    });
    assert.equal(result.ok, true);
  });

  it("rejects patch text fields", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      groups: [
        {
          id: "g1",
          title: "CLI",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
          patch: "@@ -1,1 +1,2 @@\n+secret",
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors.join("\n"), /unknown field "patch"/);
    }
  });

  it("rejects duplicate group ids and unknown dependsOn", () => {
    const group = {
      id: "g1",
      title: "A",
      summary: "",
      suggestedOrder: 0,
      hunkRefs: [],
    };
    const dup = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      groups: [group, { ...group, title: "B" }],
    });
    assert.equal(dup.ok, false);

    const missing = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      groups: [{ ...group, dependsOn: ["nope"] }],
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.match(missing.errors.join("\n"), /dependsOn unknown group/);
    }
  });

  it("requires a known size", () => {
    const missing = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      groups: [],
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.match(missing.errors.join("\n"), /size must be one of/);
    }

    const bad = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "huge",
      groups: [],
    });
    assert.equal(bad.ok, false);
  });
});

describe("hunk-meta", () => {
  it("reads @@ context and added symbols", () => {
    assert.equal(hunkContext("@@ -10,6 +10,8 @@ export function serve"), "export function serve");
    assert.equal(hunkContext("@@ -1,3 +1,4 @@"), undefined);
    assert.deepEqual(addedSymbols(["export function createInvitation() {", "const x = 1", "export type Id = string"]), [
      "createInvitation",
      "Id",
    ]);
  });

  it("does not treat nearby markdown or prose as hunk context", () => {
    assert.equal(
      hunkContext(
        "@@ -19,6 +19,10 @@ Composer 2.5: Cheap model, preferred to use when possible for: low complexity si",
      ),
      undefined,
    );
    assert.equal(hunkContext("@@ -1,3 +1,8 @@ # Heading"), undefined);
    assert.equal(
      hunkRangeLabel(
        "@@ -19,6 +19,10 @@ Composer 2.5: Cheap model, preferred to use when possible for: low complexity si",
      ),
      "@@ -19,6 +19,10 @@",
    );
  });

  it("pairs unified hunk lines into split rows", () => {
    const line = (
      kind: HunkLine["kind"],
      text: string,
      oldNumber: number | null,
      newNumber: number | null,
    ): HunkLine => ({ kind, text, oldNumber, newNumber });

    assert.deepEqual(splitDiffRows([line("ctx", "keep", 1, 1)]), [
      {
        left: { kind: "ctx", number: 1, text: "keep" },
        right: { kind: "ctx", number: 1, text: "keep" },
      },
    ]);

    assert.deepEqual(splitDiffRows([line("del", "old", 1, null), line("add", "new", null, 1)]), [
      {
        left: { kind: "del", number: 1, text: "old" },
        right: { kind: "add", number: 1, text: "new" },
      },
    ]);

    assert.deepEqual(
      splitDiffRows([
        line("del", "a", 1, null),
        line("del", "b", 2, null),
        line("add", "c", null, 1),
      ]),
      [
        {
          left: { kind: "del", number: 1, text: "a" },
          right: { kind: "add", number: 1, text: "c" },
        },
        {
          left: { kind: "del", number: 2, text: "b" },
          right: null,
        },
      ],
    );

    assert.deepEqual(splitDiffRows([line("add", "only", null, 1)]), [
      { left: null, right: { kind: "add", number: 1, text: "only" } },
    ]);
  });
});
