import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { resolveWrap } from "./narrow.ts";

describe("resolveWrap", () => {
  it("wraps by default", () => {
    assert.equal(resolveWrap(null), true);
  });

  it("lets an explicit toggle win", () => {
    assert.equal(resolveWrap(false), false);
    assert.equal(resolveWrap(true), true);
  });
});
