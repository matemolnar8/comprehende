import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { looksLikeSha, reviewRef } from "./lib/review-ref.ts";

const sha = "4657d0f3dcab95c1ac79d1a93c13397c6e646758";

describe("looksLikeSha", () => {
  it("accepts abbreviated and full hex", () => {
    assert.equal(looksLikeSha("4657d0f"), true);
    assert.equal(looksLikeSha(sha), true);
  });

  it("rejects git names", () => {
    assert.equal(looksLikeSha("HEAD"), false);
    assert.equal(looksLikeSha("main"), false);
    assert.equal(looksLikeSha("origin/main"), false);
  });
});

describe("reviewRef", () => {
  it("shortens a sha ref and copies the full sha", () => {
    assert.deepEqual(reviewRef(sha, sha), {
      display: "4657d0f",
      copy: sha,
      tooltip: sha,
    });
  });

  it("shortens an abbreviated sha to the resolved short sha", () => {
    assert.deepEqual(reviewRef("4657d0f3", sha), {
      display: "4657d0f",
      copy: sha,
      tooltip: sha,
    });
  });

  it("keeps a named ref and puts the sha in the tooltip", () => {
    assert.deepEqual(reviewRef("main", sha), {
      display: "main",
      copy: sha,
      tooltip: `main · ${sha}`,
    });
  });
});
