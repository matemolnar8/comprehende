import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { colorIndexByLayerId, groupParts, isMixedReview, PART_PALETTE_SIZE, partColor } from "./lib/parts.ts";

describe("groupParts", () => {
  it("keeps one unlabeled stack when no layer has a part name", () => {
    const parts = groupParts([
      { id: "contracts", suggestedOrder: 0 },
      { id: "git", suggestedOrder: 1 },
      { id: "docs", suggestedOrder: 2 },
    ]);
    assert.equal(parts.length, 1);
    assert.equal(parts[0]?.title, undefined);
    assert.deepEqual(parts[0]?.layerIds, ["contracts", "git", "docs"]);
    assert.equal(isMixedReview(parts), false);
  });

  it("groups layers by part name", () => {
    const parts = groupParts([
      { id: "schema", part: "Contract", suggestedOrder: 0 },
      { id: "tests", part: "Contract", suggestedOrder: 1 },
      { id: "docs", part: "README", suggestedOrder: 2 },
    ]);
    assert.equal(parts.length, 2);
    assert.equal(isMixedReview(parts), true);
    assert.deepEqual(parts[0]?.layerIds, ["schema", "tests"]);
    assert.equal(parts[0]?.title, "Contract");
    assert.deepEqual(parts[1]?.layerIds, ["docs"]);
    assert.equal(parts[1]?.title, "README");
  });

  it("orders parts by the earliest suggestedOrder in each part", () => {
    const parts = groupParts([
      { id: "late", part: "Chore", suggestedOrder: 10 },
      { id: "foundation", part: "Contract", suggestedOrder: 0 },
      { id: "call-site", part: "Contract", suggestedOrder: 1 },
    ]);
    assert.deepEqual(
      parts.map((part) => part.title),
      ["Contract", "Chore"],
    );
  });

  it("treats a layer with no part as its own column when others are named", () => {
    const parts = groupParts([
      { id: "a", part: "Auth", suggestedOrder: 0 },
      { id: "b", suggestedOrder: 1 },
    ]);
    assert.equal(parts.length, 2);
    assert.equal(parts[0]?.title, "Auth");
    assert.equal(parts[1]?.title, undefined);
    assert.deepEqual(parts[1]?.layerIds, ["b"]);
  });

  it("cycles colors after the palette length", () => {
    const layers = Array.from({ length: PART_PALETTE_SIZE + 1 }, (_, i) => ({
      id: `g${i}`,
      part: `P${i}`,
      suggestedOrder: i,
    }));
    const parts = groupParts(layers);
    assert.equal(parts.length, PART_PALETTE_SIZE + 1);
    assert.equal(parts[PART_PALETTE_SIZE]?.colorIndex, 0);
    assert.equal(partColor(7), "var(--strand-1)");
  });

  it("maps layer ids to color indexes", () => {
    const parts = groupParts([
      { id: "a", part: "A", suggestedOrder: 0 },
      { id: "b", part: "B", suggestedOrder: 1 },
    ]);
    const colors = colorIndexByLayerId(parts);
    assert.equal(colors.get("a"), 0);
    assert.equal(colors.get("b"), 1);
  });
});
