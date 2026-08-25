import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agentClipboardPrompt, agentMd, formatHunkRef, isImageSlot } from "./agent-md.ts";
import type { ApiReview } from "./types.ts";

const baseSha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const headSha = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

describe("formatHunkRef", () => {
  it("formats a git hunk header with the path", () => {
    assert.equal(
      formatHunkRef({ path: "src/auth/session.ts", oldStart: 1, oldLines: 20, newStart: 1, newLines: 40 }),
      "src/auth/session.ts @@ -1,20 +1,40 @@",
    );
  });

  it("prefixes a rename", () => {
    assert.equal(
      formatHunkRef({
        path: "src/helpers.ts",
        oldPath: "src/util.ts",
        oldStart: 4,
        oldLines: 8,
        newStart: 4,
        newLines: 12,
      }),
      "src/util.ts -> src/helpers.ts @@ -4,8 +4,12 @@",
    );
  });
});

describe("isImageSlot", () => {
  it("detects a zero range", () => {
    assert.equal(isImageSlot({ path: "assets/dot.png", oldStart: 0, oldLines: 0, newStart: 0, newLines: 0 }), true);
    assert.equal(isImageSlot({ path: "src/app.ts", oldStart: 1, oldLines: 3, newStart: 1, newLines: 8 }), false);
  });
});

describe("agentClipboardPrompt", () => {
  it("points at the markdown URL and stays short", () => {
    const url = "http://127.0.0.1:4567/api/agent/overview.md";
    const prompt = agentClipboardPrompt(url);
    assert.equal(prompt, `Answer the following questions by using ${url}`);
    assert.equal(prompt.includes("git diff"), false);
    assert.ok(prompt.length < 120);
  });
});

describe("agentMd", () => {
  it("puts steps first, pins SHAs, and thins concerns on the overview", () => {
    const prompt = agentMd(sampleReview(), { kind: "agent-md", target: "overview" });
    assert.ok(prompt !== null);
    assert.match(prompt, /^Answer questions about this git change\./);
    assert.match(prompt, /## Steps/);
    assert.match(prompt, /When no question follows this paste, explain this change\./);
    assert.match(prompt, new RegExp(`git diff --find-renames ${baseSha} ${headSha}`));
    assert.match(prompt, /## Pin/);
    assert.match(prompt, /## Review concerns/);
    assert.match(prompt, /Session cookie helper \(`cookie`\)/);
    assert.match(prompt, /setSessionCookie applies the required options\./);
    assert.match(prompt, /\[groups\/cookie\.md\]\(groups\/cookie\.md\)/);
    assert.match(prompt, /\[groups\/login\.md\]\(groups\/login\.md\)/);
    assert.match(prompt, /Read Review concerns\. Fetch a concern file only when that concern is relevant/);
    assert.match(prompt, /Done when every concern the question touches has its markdown loaded/);
    assert.match(prompt, /When you show code, quote the live git lines/);
    assert.match(prompt, /Done when the answer quotes the live code/);
    assert.match(prompt, /#24 Explain with coding agent button/);
    assert.match(prompt, /Unassigned live hunks: 2/);
    assert.match(prompt, /Done when both objects exist/);
    assert.match(prompt, /Live git wins when they disagree/);
    assert.match(prompt, /Repository: comprehende/);
    assert.match(prompt, /Origin: git@github\.com:matemolnar8\/comprehende\.git/);
    assert.match(prompt, /Commits:/);
    assert.ok(prompt.indexOf("## Steps") < prompt.indexOf("## Pin"));
    assert.ok(prompt.indexOf("## Pin") < prompt.indexOf("## Review concerns"));
    assert.doesNotMatch(prompt, /The login route needs one helper/);
    assert.doesNotMatch(prompt, /Identify it in live git first/);
    assert.doesNotMatch(prompt, /Do not fetch every file/);
    assert.doesNotMatch(prompt, /Do not show hunk refs/);
    assert.doesNotMatch(prompt, /Humans cannot read hunk refs/);
    assert.doesNotMatch(prompt, /src\/auth\/session\.ts @@/);
    assert.doesNotMatch(prompt, /src\/api\/login\.ts @@/);
    assert.doesNotMatch(prompt, /Hunk refs:/);
    assert.doesNotMatch(prompt, /Look for:/);
    assert.doesNotMatch(prompt, /Breaking\. Throws when httpOnly is false/);
    assert.equal(prompt.includes("+++"), false);
  });

  it("scopes a group prompt to that concern's hunks without overview-only reference", () => {
    const prompt = agentMd(sampleReview(), { kind: "agent-md", target: "group", group: "cookie" });
    assert.ok(prompt !== null);
    assert.match(prompt, /^Answer questions about this review concern\./);
    assert.match(prompt, /When no question follows this paste, explain this review concern\./);
    assert.match(prompt, /Review concern 01 of 02: Session cookie helper \(`cookie`\)/);
    assert.match(prompt, /src\/auth\/session\.ts @@ -1,20 \+1,40 @@/);
    assert.match(prompt, /src\/util\.ts -> src\/helpers\.ts @@ -4,8 \+4,12 @@/);
    assert.match(prompt, /A hunk ref is a pointer into the live git diff at the pinned SHAs/);
    assert.match(prompt, /Hunk refs with @@ -0,0 \+0,0 @@ are image or binary slots/);
    assert.match(prompt, /When you show code, quote the live git lines/);
    assert.match(prompt, /Done when the answer quotes the live code/);
    assert.match(prompt, /## Pin/);
    assert.ok(prompt.indexOf("## Steps") < prompt.indexOf("## Pin"));
    assert.doesNotMatch(prompt, /src\/api\/login\.ts/);
    assert.doesNotMatch(prompt, /Tickets:/);
    assert.doesNotMatch(prompt, /Commits:/);
    assert.doesNotMatch(prompt, /cites the matching hunk refs/);
    assert.doesNotMatch(prompt, /groups\/login\.md/);
    assert.doesNotMatch(prompt, /Identify it in live git first/);
    assert.doesNotMatch(prompt, /Do not show hunk refs/);
  });

  it("returns null for an unknown group", () => {
    assert.equal(agentMd(sampleReview(), { kind: "agent-md", target: "group", group: "missing" }), null);
  });

  it("omits silent why, tickets, and coverage", () => {
    const review = sampleReview();
    delete review.document.why;
    delete review.document.tickets;
    review.coverage.unassignedCount = 0;
    review.coverage.staleCount = 0;
    review.commits = [];
    const prompt = agentMd(review, { kind: "agent-md", target: "overview" });
    assert.ok(prompt !== null);
    assert.doesNotMatch(prompt, /Ticket #24 needs a prompt a coding agent can paste/);
    assert.doesNotMatch(prompt, /Tickets:/);
    assert.doesNotMatch(prompt, /Unassigned live hunks/);
    assert.doesNotMatch(prompt, /^Commits:/m);
    assert.match(prompt, /The what \(medium\):/);
  });

  it("omits origin when the repo has no remote", () => {
    const review = sampleReview();
    review.repo = { name: "example", origin: null };
    const prompt = agentMd(review, { kind: "agent-md", target: "overview" });
    assert.ok(prompt !== null);
    assert.match(prompt, /Repository: example/);
    assert.doesNotMatch(prompt, /^Origin:/m);
    assert.doesNotMatch(prompt, / {3}Origin:/);
  });
});

function sampleReview(): ApiReview {
  return {
    document: {
      version: 1,
      source: { baseRef: "main", headRef: "HEAD", range: "main...HEAD" },
      size: "medium",
      why: "Ticket #24 needs a prompt a coding agent can paste.",
      summary: "Adds a copy-prompt control to overview and group.",
      tickets: [
        {
          id: "#24",
          title: "Explain with coding agent button",
          url: "https://github.com/matemolnar8/comprehende/issues/24",
        },
      ],
      groups: [
        {
          id: "cookie",
          title: "Session cookie helper",
          why: "The login route needs one helper.",
          summary: "setSessionCookie applies the required options.",
          lookFor: ["Breaking. Throws when httpOnly is false."],
          part: "Session cookie",
          suggestedOrder: 0,
          hunkRefs: [
            { path: "src/auth/session.ts", oldStart: 1, oldLines: 20, newStart: 1, newLines: 40 },
            { path: "assets/dot.png", oldStart: 0, oldLines: 0, newStart: 0, newLines: 0 },
            {
              path: "src/helpers.ts",
              oldPath: "src/util.ts",
              oldStart: 4,
              oldLines: 8,
              newStart: 4,
              newLines: 12,
            },
          ],
        },
        {
          id: "login",
          title: "Login route",
          why: "The route must set cookies through the helper.",
          summary: "The login route uses setSessionCookie.",
          dependsOn: ["cookie"],
          suggestedOrder: 1,
          hunkRefs: [{ path: "src/api/login.ts", oldStart: 10, oldLines: 8, newStart: 10, newLines: 24 }],
        },
      ],
    },
    resolved: {
      baseRef: "main",
      headRef: "HEAD",
      range: "main...HEAD",
      baseSha,
      headSha,
    },
    coverage: {
      totalHunks: 5,
      assignedHunks: 3,
      unassignedCount: 2,
      staleCount: 0,
    },
    groups: [
      {
        id: "cookie",
        title: "Session cookie helper",
        why: "The login route needs one helper.",
        summary: "setSessionCookie applies the required options.",
        lookFor: ["Breaking. Throws when httpOnly is false."],
        dependsOn: [],
        part: "Session cookie",
        suggestedOrder: 0,
        hunkCount: 3,
        staleCount: 0,
        files: ["src/auth/session.ts", "assets/dot.png", "src/helpers.ts"],
      },
      {
        id: "login",
        title: "Login route",
        why: "The route must set cookies through the helper.",
        summary: "The login route uses setSessionCookie.",
        lookFor: [],
        dependsOn: ["cookie"],
        suggestedOrder: 1,
        hunkCount: 1,
        staleCount: 0,
        files: ["src/api/login.ts"],
      },
    ],
    unassigned: { hunkCount: 2, files: ["README.md"] },
    lockfiles: { fileCount: 0, files: [] },
    stale: [],
    files: [
      { path: "src/auth/session.ts", status: "modified", binary: false, image: false, hunkCount: 1 },
      { path: "src/api/login.ts", status: "modified", binary: false, image: false, hunkCount: 1 },
    ],
    skipped: [],
    commits: [
      {
        sha: headSha,
        shortSha: headSha.slice(0, 7),
        subject: "Split session cookie helper",
        body: "",
        author: "Comprehende Fixture",
        date: "2026-08-24",
      },
    ],
    repo: {
      name: "comprehende",
      origin: "git@github.com:matemolnar8/comprehende.git",
    },
  };
}
