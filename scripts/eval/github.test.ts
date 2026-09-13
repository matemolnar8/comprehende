import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  caseIdFor,
  collectFrozenUrls,
  expandAllowedUrl,
  linkedIssueNumbers,
  parseGithubPrUrl,
} from "./github.ts";

describe("eval github helpers", () => {
  it("parses pull URLs and linked issues", () => {
    assert.deepEqual(parseGithubPrUrl("https://github.com/matemolnar8/comprehende/pull/47"), {
      owner: "matemolnar8",
      repo: "comprehende",
      pr: 47,
    });
    assert.equal(caseIdFor("comprehende", 47), "comprehende-47");
    assert.deepEqual(linkedIssueNumbers("Closes #46\nSee PR #49 and https://github.com/matemolnar8/comprehende/issues/12"), [
      12, 46,
    ]);
  });

  it("collects html_url values and expands pull to issues", () => {
    const urls = collectFrozenUrls({
      html_url: "https://github.com/matemolnar8/comprehende/pull/47",
      comments: [{ html_url: "https://github.com/matemolnar8/comprehende/pull/47#discussion_r1" }],
    });
    assert.ok(urls.has("https://github.com/matemolnar8/comprehende/pull/47"));
    assert.ok(urls.has("https://github.com/matemolnar8/comprehende/issues/47"));
    assert.deepEqual(expandAllowedUrl("https://github.com/matemolnar8/comprehende/pull/47/"), [
      "https://github.com/matemolnar8/comprehende/pull/47",
      "https://github.com/matemolnar8/comprehende/issues/47",
    ]);
  });
});
