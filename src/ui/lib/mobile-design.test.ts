import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMobileDesign, selectionCaption } from "./mobile-design.ts";

const meta = {
  document: { title: "Pin reviews to SHAs" },
  groups: [
    { id: "auth", title: "Keep the pin at serve time" },
    { id: "ui", title: "Show the resolved range" },
  ],
} as const;

describe("mobile design", () => {
  it("accepts the three named layouts and defaults to overlay", () => {
    assert.equal(parseMobileDesign("overlay"), "overlay");
    assert.equal(parseMobileDesign("stack"), "stack");
    assert.equal(parseMobileDesign("dock"), "dock");
    assert.equal(parseMobileDesign(null), "overlay");
    assert.equal(parseMobileDesign("wide"), "overlay");
  });

  it("names the current selection for the mobile chrome", () => {
    assert.deepEqual(selectionCaption(meta, { kind: "overview" }), { title: "Overview" });
    assert.deepEqual(selectionCaption(meta, { kind: "group", id: "ui" }), {
      index: "02",
      title: "Show the resolved range",
    });
    assert.deepEqual(selectionCaption(meta, { kind: "unassigned" }), { title: "Unassigned" });
    assert.deepEqual(selectionCaption(meta, { kind: "lockfiles" }), { title: "Lockfiles" });
  });
});
