import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  caseIdFor,
  collectFrozenUrls,
  expandAllowedUrl,
  linkedIssueNumbers,
  parseGithubCommitUrl,
  parseGithubPrUrl,
  parseGithubRepoRemote,
  shaInRange,
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

  it("parses commit and repo remotes, and matches range SHAs", () => {
    assert.deepEqual(
      parseGithubCommitUrl("https://github.com/matemolnar8/comprehende/commit/16565def6a52a638a09689dc5f6ddfe45cab1504/"),
      {
        owner: "matemolnar8",
        repo: "comprehende",
        sha: "16565def6a52a638a09689dc5f6ddfe45cab1504",
      },
    );
    assert.equal(parseGithubCommitUrl("https://github.com/matemolnar8/comprehende/pull/67"), undefined);
    assert.deepEqual(parseGithubRepoRemote("https://github.com/matemolnar8/comprehende.git"), {
      owner: "matemolnar8",
      repo: "comprehende",
    });
    assert.deepEqual(parseGithubRepoRemote("git@github.com:matemolnar8/comprehende.git"), {
      owner: "matemolnar8",
      repo: "comprehende",
    });
    const range = ["c7978bdc875cecaa6e396c724e48bac751b1e10b", "16565def6a52a638a09689dc5f6ddfe45cab1504"];
    assert.equal(shaInRange("16565def", range), true);
    assert.equal(shaInRange("deadbeefdeadbeefdeadbeefdeadbeefdeadbeef", range), false);
    assert.equal(shaInRange("16565d", range), false);
  });
});
