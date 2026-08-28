import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WAIT_REVEAL_MS, waitCopy, waitVisible } from "./wait.ts";

describe("waitVisible", () => {
  it("hides until the delay has passed", () => {
    assert.equal(waitVisible(true, 0), false);
    assert.equal(waitVisible(true, WAIT_REVEAL_MS - 1), false);
    assert.equal(waitVisible(true, WAIT_REVEAL_MS), true);
  });

  it("hides when the request is not active", () => {
    assert.equal(waitVisible(false, WAIT_REVEAL_MS), false);
    assert.equal(waitVisible(false, 0, 0), false);
  });

  it("shows at once when the delay is zero", () => {
    assert.equal(waitVisible(true, 0, 0), true);
  });
});

describe("waitCopy", () => {
  it("names the live git read, not the HTTP call", () => {
    assert.equal(waitCopy.review, "Reading the review.");
    assert.equal(waitCopy.group, "Reading git.");
    assert.equal(waitCopy.file, "Reading this file.");
    assert.equal(waitCopy.blame, "Reading blame.");
    assert.equal(waitCopy.lockfile, "Reading the lockfile.");
  });
});
