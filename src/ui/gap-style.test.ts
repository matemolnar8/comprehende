import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXPANSION_LINE_COUNT, GAP_CSS, GAP_SEPARATOR } from "./lib/gap-style.ts";

describe("hunk gap", () => {
  it("uses the compact bar separator", () => {
    assert.equal(GAP_SEPARATOR, "line-info-basic");
  });

  it("reveals a short gap in one click and keeps a long gap collapsed", () => {
    assert.equal(EXPANSION_LINE_COUNT, 10);
    assert.equal(3 < EXPANSION_LINE_COUNT, true);
    assert.equal(138 > EXPANSION_LINE_COUNT, true);
  });

  it("styles unfold arrows and expand all on the bar", () => {
    assert.equal(GAP_CSS.includes("[data-expand-down]::before"), true);
    assert.equal(GAP_CSS.includes("[data-expand-all-button]"), true);
    assert.equal(GAP_CSS.includes("dashed"), false);
    assert.equal(GAP_CSS.includes("grid-column: 3"), false);
  });
});
