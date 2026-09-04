import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { agentClipboardPrompt, agentMd, formatHunkRef, isImageSlot } from "./agent-md.ts";
import type { ApiReview } from "./types.ts";

const baseSha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const headSha = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

describe("hunk refs", () => {
  it("formats headers and detects image slots", () => {
    const formatCases: Array<{ ref: Parameters<typeof formatHunkRef>[0]; expected: string }> = [
      {
        ref: { path: "src/auth/session.ts", oldStart: 1, oldLines: 20, newStart: 1, newLines: 40 },
        expected: "src/auth/session.ts @@ -1,20 +1,40 @@",
      },
      {
        ref: {
          path: "src/helpers.ts",
          oldPath: "src/util.ts",
          oldStart: 4,
          oldLines: 8,
          newStart: 4,
          newLines: 12,
        },
        expected: "src/util.ts -> src/helpers.ts @@ -4,8 +4,12 @@",
      },
    ];
    for (const { ref, expected } of formatCases) {
      assert.equal(formatHunkRef(ref), expected);
    }

    const slotCases: Array<{ ref: Parameters<typeof isImageSlot>[0]; expected: boolean }> = [
      {
        ref: { path: "assets/dot.png", oldStart: 0, oldLines: 0, newStart: 0, newLines: 0 },
        expected: true,
      },
      {
        ref: { path: "src/app.ts", oldStart: 1, oldLines: 3, newStart: 1, newLines: 8 },
        expected: false,
      },
    ];
    for (const { ref, expected } of slotCases) {
      assert.equal(isImageSlot(ref), expected);
    }
  });
});

describe("agentClipboardPrompt", () => {
  it("points at the markdown URL without patch text", () => {
    const url = "http://127.0.0.1:4567/api/agent/overview.md";
    const prompt = agentClipboardPrompt(url);
    assert.ok(prompt.includes(url));
    assert.equal(prompt.includes("git diff"), false);
  });
});

describe("agentMd", () => {
  it("pins SHAs, orders Steps before Pin, and links groups without patch text", () => {
    const prompt = agentMd(sampleReview(), { kind: "agent-md", target: "overview" });
    assert.ok(prompt !== null);
    assert.ok(prompt.includes(baseSha));
    assert.ok(prompt.includes(headSha));
    assert.ok(prompt.includes("git diff"));
    assert.ok(prompt.includes("## Steps"));
    assert.ok(prompt.includes("## Pin"));
    assert.ok(prompt.includes("## Review concerns"));
    assert.ok(prompt.indexOf("## Steps") < prompt.indexOf("## Pin"));
    assert.ok(prompt.indexOf("## Pin") < prompt.indexOf("## Review concerns"));
    assert.ok(prompt.includes("groups/cookie.md"));
    assert.ok(prompt.includes("groups/login.md"));
    assert.equal(prompt.includes("+++"), false);
    assert.equal(prompt.includes("Hunk refs:"), false);
    assert.doesNotMatch(prompt, /@@ -\d/);
  });

  it("scopes a group prompt to that concern's hunks", () => {
    const prompt = agentMd(sampleReview(), { kind: "agent-md", target: "group", group: "cookie" });
    assert.ok(prompt !== null);
    assert.ok(prompt.includes(baseSha));
    assert.ok(prompt.includes(headSha));
    assert.ok(prompt.includes("## Steps"));
    assert.ok(prompt.includes("## Pin"));
    assert.ok(prompt.indexOf("## Steps") < prompt.indexOf("## Pin"));
    assert.ok(prompt.includes("src/auth/session.ts"));
    assert.ok(prompt.includes("src/helpers.ts"));
    assert.ok(prompt.includes("@@"));
    assert.equal(prompt.includes("src/api/login.ts"), false);
    assert.equal(prompt.includes("groups/login.md"), false);
    assert.equal(prompt.includes("+++"), false);
  });

  it("returns null for an unknown group", () => {
    assert.equal(agentMd(sampleReview(), { kind: "agent-md", target: "group", group: "missing" }), null);
  });

  it("omits silent why, sources, and coverage", () => {
    const review = sampleReview();
    delete review.document.why;
    delete review.document.sources;
    review.coverage.unassignedCount = 0;
    review.coverage.staleCount = 0;
    review.commits = [];
    const prompt = agentMd(review, { kind: "agent-md", target: "overview" });
    assert.ok(prompt !== null);
    assert.doesNotMatch(prompt, /Ticket #24 needs a prompt a coding agent can paste/);
    assert.doesNotMatch(prompt, /Tickets:/);
    assert.doesNotMatch(prompt, /Sources:/);
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
      title: "Ask AI about this review",
      why: "Ticket #24 needs a prompt a coding agent can paste.",
      summary: "Adds a copy-prompt control to overview and group.",
      sources: [
        {
          id: "s1",
          kind: "ticket",
          label: "#24",
          title: "Explain with coding agent button",
          gist: "Explain with coding agent button",
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
      staleSourceCount: 0,
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
        sources: [],
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
        sources: [],
        hunkCount: 1,
        staleCount: 0,
        files: ["src/api/login.ts"],
      },
    ],
    unassigned: { hunkCount: 2, files: ["README.md"] },
    lockfiles: { fileCount: 0, files: [] },
    stale: [],
    staleSources: [],
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
