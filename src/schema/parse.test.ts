import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseReviewDocument } from "./parse.ts";
import { addedSymbols, hunkContext, hunkRangeLabel } from "./hunk-meta.ts";

describe("parseReviewDocument", () => {
  it("accepts a minimal valid document", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
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
      groups: [group, { ...group, title: "B" }],
    });
    assert.equal(dup.ok, false);

    const missing = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      groups: [{ ...group, dependsOn: ["nope"] }],
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.match(missing.errors.join("\n"), /dependsOn unknown group/);
    }
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
});
