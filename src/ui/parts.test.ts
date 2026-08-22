import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { colorIndexByGroupId, groupParts, isMixedReview, PART_PALETTE_SIZE, partColor } from "./lib/parts.ts";

describe("groupParts", () => {
  it("keeps one unlabeled stack when no group has a part name", () => {
    const parts = groupParts([
      { id: "contracts", suggestedOrder: 0 },
      { id: "git", suggestedOrder: 1 },
      { id: "docs", suggestedOrder: 2 },
    ]);
    assert.equal(parts.length, 1);
    assert.equal(parts[0]?.title, undefined);
    assert.deepEqual(parts[0]?.groupIds, ["contracts", "git", "docs"]);
    assert.equal(isMixedReview(parts), false);
  });

  it("puts same-part groups in one column", () => {
    const parts = groupParts([
      { id: "schema", part: "Contract", suggestedOrder: 0 },
      { id: "tests", part: "Contract", suggestedOrder: 1 },
      { id: "docs", part: "README", suggestedOrder: 2 },
    ]);
    assert.equal(parts.length, 2);
    assert.equal(isMixedReview(parts), true);
    assert.deepEqual(parts[0]?.groupIds, ["schema", "tests"]);
    assert.equal(parts[0]?.title, "Contract");
    assert.deepEqual(parts[1]?.groupIds, ["docs"]);
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

  it("treats a group with no part as its own column when others are named", () => {
    const parts = groupParts([
      { id: "a", part: "Auth", suggestedOrder: 0 },
      { id: "b", suggestedOrder: 1 },
    ]);
    assert.equal(parts.length, 2);
    assert.equal(parts[0]?.title, "Auth");
    assert.equal(parts[1]?.title, undefined);
    assert.deepEqual(parts[1]?.groupIds, ["b"]);
  });

  it("cycles colors after the palette length", () => {
    const groups = Array.from({ length: PART_PALETTE_SIZE + 1 }, (_, i) => ({
      id: `g${i}`,
      part: `P${i}`,
      suggestedOrder: i,
    }));
    const parts = groupParts(groups);
    assert.equal(parts.length, PART_PALETTE_SIZE + 1);
    assert.equal(parts[PART_PALETTE_SIZE]?.colorIndex, 0);
    assert.equal(partColor(7), "var(--strand-1)");
  });

  it("maps group ids to color indexes", () => {
    const parts = groupParts([
      { id: "a", part: "A", suggestedOrder: 0 },
      { id: "b", part: "B", suggestedOrder: 1 },
    ]);
    const colors = colorIndexByGroupId(parts);
    assert.equal(colors.get("a"), 0);
    assert.equal(colors.get("b"), 1);
  });
});
