import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_GAP_STYLE,
  EXPANSION_LINE_COUNT,
  GAP_STYLES,
  gapSeparator,
  gapStyleCSS,
  parseGapStyle,
} from "./lib/gap-style.ts";

describe("gap style", () => {
  it("treats missing or unknown values as edges", () => {
    assert.equal(parseGapStyle(null), DEFAULT_GAP_STYLE);
    assert.equal(parseGapStyle(""), "edges");
    assert.equal(parseGapStyle("github"), "edges");
  });

  it("accepts the three designs", () => {
    assert.deepEqual(GAP_STYLES, ["edges", "fold", "bar"]);
    assert.equal(parseGapStyle("edges"), "edges");
    assert.equal(parseGapStyle("fold"), "fold");
    assert.equal(parseGapStyle("bar"), "bar");
  });

  it("maps fold to the rounded separator and the others to the compact bar", () => {
    assert.equal(gapSeparator("fold"), "line-info");
    assert.equal(gapSeparator("edges"), "line-info-basic");
    assert.equal(gapSeparator("bar"), "line-info-basic");
  });

  it("reveals a short gap in one click and keeps a long gap collapsed", () => {
    assert.equal(EXPANSION_LINE_COUNT, 10);
    assert.equal(3 < EXPANSION_LINE_COUNT, true);
    assert.equal(138 > EXPANSION_LINE_COUNT, true);
  });

  it("gives each design its own separator CSS", () => {
    const edges = gapStyleCSS("edges");
    const fold = gapStyleCSS("fold");
    const bar = gapStyleCSS("bar");
    assert.equal(edges.includes("[data-expand-down]::before"), true);
    assert.equal(fold.includes("grid-column: 3"), true);
    assert.equal(bar.includes("dashed"), true);
    assert.equal(bar.includes("border-radius: 999px"), true);
    assert.equal(edges === fold, false);
    assert.equal(fold === bar, false);
  });
});
