import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildComparePayload, compareReviews } from "./compare.ts";
import { formatCompare } from "./compare-format.ts";
import type { HunkRef, ReviewDocument, ReviewGroup } from "../schema/types.ts";

describe("formatCompare", () => {
  it("says when the interpretation did not change", () => {
    const document = sample();
    const text = formatCompare(buildComparePayload("/tmp/from.json", document, "/tmp/to.json", document));
    assert.match(text, /^Interpretation\n/);
    assert.match(text, /The interpretation did not change\.\n$/);
    assert.equal(text.includes("@@"), false);
  });

  it("prints added, removed, retitled, and regrouped groups", () => {
    const shared = hunk("src/a.ts", 1);
    const extra = hunk("src/b.ts", 4);
    const from = sample({
      title: "Old",
      groups: [
        group("cookie", { title: "Cookie helper", suggestedOrder: 0, hunkRefs: [shared] }),
        group("docs", { title: "Docs", suggestedOrder: 1, hunkRefs: [hunk("README.md", 1)] }),
      ],
    });
    const to = sample({
      title: "New",
      groups: [
        group("cookie", { title: "Session cookie", suggestedOrder: 0, hunkRefs: [shared, extra] }),
        group("logout", { title: "Logout", suggestedOrder: 1, hunkRefs: [hunk("logout.ts", 1)] }),
      ],
    });
    const text = formatCompare(buildComparePayload("from.json", from, "to.json", to));
    assert.match(text, /title\n    From  Old\n    To    New/);
    assert.match(text, /added    Logout  \(logout\)/);
    assert.match(text, /removed  Docs  \(docs\)/);
    assert.match(text, /Session cookie  \(cookie\)/);
    assert.match(text, /matched by id/);
    assert.match(text, /title\n      From  Cookie helper\n      To    Session cookie/);
    assert.match(text, /\+ src\/b\.ts @@ -4,1 \+4,2 @@/);
    assert.equal(compareReviews(from, to).identical, false);
  });
});

function sample(over: Partial<ReviewDocument> = {}): ReviewDocument {
  return {
    version: 1,
    source: { baseRef: "main", headRef: "HEAD" },
    size: "small",
    title: "Review",
    summary: "A change.",
    groups: [group("all", { hunkRefs: [hunk("src/a.ts", 1)] })],
    ...over,
  };
}

function group(id: string, over: Partial<ReviewGroup> = {}): ReviewGroup {
  return {
    id,
    title: id,
    why: `Why ${id}.`,
    summary: `What ${id}.`,
    suggestedOrder: 0,
    hunkRefs: [],
    ...over,
  };
}

function hunk(path: string, start: number): HunkRef {
  return { path, oldStart: start, oldLines: 1, newStart: start, newLines: 2 };
}
