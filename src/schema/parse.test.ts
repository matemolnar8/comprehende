import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseReviewDocument } from "./parse.ts";

describe("parseReviewDocument", () => {
  it("accepts a minimal valid document", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      groups: [
        {
          id: "g1",
          title: "CLI",
          summary: "Adds a command.",
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

  it("rejects duplicate group ids", () => {
    const group = {
      id: "g1",
      title: "A",
      summary: "",
      suggestedOrder: 0,
      hunkRefs: [],
    };
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      groups: [group, { ...group, title: "B" }],
    });
    assert.equal(result.ok, false);
  });
});
