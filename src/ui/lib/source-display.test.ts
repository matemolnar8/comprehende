import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LinePinnedSource } from "../../schema/types.ts";
import { visibleFileComments } from "./source-display.ts";

function comment(id: string): LinePinnedSource {
  return {
    id,
    kind: "pr-comment",
    label: id,
    path: "src/app.ts",
    side: "new",
    line: 1,
    author: "reviewer",
    body: "Please look at this.",
  };
}

describe("visibleFileComments", () => {
  it("returns none when comments are hidden", () => {
    assert.deepEqual(visibleFileComments([comment("s1")], false, new Set()), []);
  });

  it("marks stale pins when comments are shown", () => {
    const shown = visibleFileComments([comment("s1"), comment("s2")], true, new Set(["s2"]));
    assert.equal(shown.length, 2);
    assert.equal(shown[0]?.stale, false);
    assert.equal(shown[1]?.stale, true);
  });
});
