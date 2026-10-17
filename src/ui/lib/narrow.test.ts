import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { resolveWrap } from "./narrow.ts";

describe("resolveWrap", () => {
  it("wraps by default on narrow screens", () => {
    assert.equal(resolveWrap(null, true), true);
  });

  it("scrolls by default on wide screens", () => {
    assert.equal(resolveWrap(null, false), false);
  });

  it("lets an explicit toggle win on either width", () => {
    assert.equal(resolveWrap(false, true), false);
    assert.equal(resolveWrap(true, false), true);
  });
});
