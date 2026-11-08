import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { guessSize } from "./size.ts";

describe("guessSize", () => {
  it("bands reviewable lines and names the band", () => {
    assert.deepEqual(guessSize(5), { size: "trivial", reason: "under 20 reviewable lines" });
    assert.deepEqual(guessSize(20), { size: "small", reason: "20-199 reviewable lines" });
    assert.equal(guessSize(549).size, "medium");
    assert.deepEqual(guessSize(550), { size: "large", reason: "550-1,999 reviewable lines" });
    assert.deepEqual(guessSize(7390), { size: "very-large", reason: "2,000+ reviewable lines" });
  });
});
