import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ASK_CTA } from "./lib/cta.ts";

describe("ASK_CTA", () => {
  it("keeps the chosen idle label", () => {
    assert.equal(ASK_CTA.label, "Ask AI about this");
    assert.equal(ASK_CTA.copied, "Copied");
  });
});
