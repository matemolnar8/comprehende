import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseReviewDocument } from "./parse.ts";
import { addedSymbols, hunkContext, hunkRangeLabel, splitDiffRows, type HunkLine } from "./hunk-meta.ts";

describe("parseReviewDocument", () => {
  it("accepts a minimal valid document", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      why: "Split the review document from live git.",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          lookFor: ["Check the flag parsing."],
          suggestedOrder: 0,
          hunkRefs: [
            { path: "src/cli/main.ts", oldStart: 1, oldLines: 3, newStart: 1, newLines: 8 },
          ],
        },
      ],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.document.title, "Review command");
      assert.equal(result.document.why, "Split the review document from live git.");
      assert.equal(result.document.summary, "Adds a review command.");
      assert.equal(result.document.groups[0]?.why, "The command is how an agent starts a review.");
    }
  });

  it("accepts a part name on a group", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          part: "Flags",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.document.groups[0]?.part, "Flags");
    }
  });

  it("accepts a part name on a legacy ticket and stores it as a source", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      tickets: [{ id: "#12", title: "Split the git index from the UI", part: "Hunk identity" }],
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.document.sources?.[0]?.kind, "ticket");
      assert.equal(result.document.sources?.[0]?.id, "#12");
      assert.equal(result.document.sources?.[0]?.label, "#12");
      assert.equal(result.document.sources?.[0]?.part, "Hunk identity");
    }
  });

  it("accepts sources and group source ids", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      why: "Reviewers asked for [a cap on retries](source:s2), and [#24](source:s1) tracks the feature.",
      sources: [
        {
          id: "s1",
          kind: "ticket",
          label: "#24",
          url: "https://example.test/24",
          gist: "Tracks the copy-prompt work.",
        },
        {
          id: "s2",
          kind: "pr-comment",
          label: "alice on PR #32",
          author: "alice",
          body: "Please cap retries.",
          path: "src/cli/main.ts",
          side: "new",
          line: 12,
        },
      ],
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          sources: ["s1"],
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.document.sources?.length, 2);
      assert.equal(result.document.groups[0]?.sources?.[0], "s1");
      assert.equal(result.document.sources?.[1]?.body, "Please cap retries.");
    }
  });

  it("rejects unknown group source ids and mixed tickets plus sources", () => {
    const missing = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          sources: ["nope"],
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.match(missing.errors.join("\n"), /sources unknown id "nope"/);
    }

    const mixed = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      tickets: [{ id: "#12" }],
      sources: [{ id: "s1", kind: "ticket", label: "#12" }],
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(mixed.ok, false);
    if (!mixed.ok) {
      assert.match(mixed.errors.join("\n"), /both sources and tickets/);
    }
  });

  it("rejects a transcript url and comment fields on a ticket", () => {
    const transcript = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      sources: [{ id: "t1", kind: "transcript", label: "Cursor session", url: "https://example.test" }],
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(transcript.ok, false);
    if (!transcript.ok) {
      assert.match(transcript.errors.join("\n"), /url must be omitted for transcripts/);
    }

    const extra = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      sources: [{ id: "s1", kind: "ticket", label: "#1", author: "alice" }],
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(extra.ok, false);
    if (!extra.ok) {
      assert.match(extra.errors.join("\n"), /author is only valid on pr-comment sources/);
    }
  });

  it("rejects patch text fields", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
          patch: "@@ -1,1 +1,2 @@\n+secret",
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors.join("\n"), /unknown field "patch"/);
    }
  });

  it("rejects duplicate group ids and unknown dependsOn", () => {
    const group = {
      id: "g1",
      title: "A",
      why: "Enables later groups.",
      summary: "",
      suggestedOrder: 0,
      hunkRefs: [],
    };
    const dup = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      groups: [group, { ...group, title: "B" }],
    });
    assert.equal(dup.ok, false);

    const missing = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      groups: [{ ...group, dependsOn: ["nope"] }],
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.match(missing.errors.join("\n"), /dependsOn unknown group/);
    }
  });

  it("requires a known size", () => {
    const missing = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      groups: [],
    });
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.match(missing.errors.join("\n"), /size must be one of/);
    }

    const bad = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "huge",
      groups: [],
    });
    assert.equal(bad.ok, false);
  });

  it("requires a why on each group", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      groups: [
        {
          id: "g1",
          title: "CLI",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors.join("\n"), /groups\[0\]\.why must be a string/);
    }
  });

  it("requires a title on the document", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      summary: "Adds a review command.",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors.join("\n"), /title must be a string/);
    }
  });

  it("requires a summary on the document", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors.join("\n"), /summary must be a string/);
    }
  });

  it("rejects an empty group why", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "   ",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors.join("\n"), /groups\[0\]\.why must be a non-empty string/);
    }
  });

  it("rejects walkthrough as an unknown document field", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      walkthrough: "Stop per-song lookups from flooding the API.",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "The command is how an agent starts a review.",
          summary: "Adds a command.",
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors.join("\n"), /unknown field "walkthrough"/);
    }
  });
});

describe("hunk-meta", () => {
  it("reads @@ context and added symbols", () => {
    assert.equal(hunkContext("@@ -10,6 +10,8 @@ export function serve"), "export function serve");
    assert.equal(hunkContext("@@ -1,3 +1,4 @@"), undefined);
    assert.deepEqual(addedSymbols(["export function createInvitation() {", "const x = 1", "export type Id = string"]), [
      "createInvitation",
      "Id",
    ]);
  });

  it("does not treat nearby markdown or prose as hunk context", () => {
    assert.equal(
      hunkContext(
        "@@ -19,6 +19,10 @@ Composer 2.5: Cheap model, preferred to use when possible for: low complexity si",
      ),
      undefined,
    );
    assert.equal(hunkContext("@@ -1,3 +1,8 @@ # Heading"), undefined);
    assert.equal(
      hunkRangeLabel(
        "@@ -19,6 +19,10 @@ Composer 2.5: Cheap model, preferred to use when possible for: low complexity si",
      ),
      "@@ -19,6 +19,10 @@",
    );
  });

  it("pairs unified hunk lines into split rows", () => {
    const line = (
      kind: HunkLine["kind"],
      text: string,
      oldNumber: number | null,
      newNumber: number | null,
    ): HunkLine => ({ kind, text, oldNumber, newNumber });

    assert.deepEqual(splitDiffRows([line("ctx", "keep", 1, 1)]), [
      {
        left: { kind: "ctx", number: 1, text: "keep" },
        right: { kind: "ctx", number: 1, text: "keep" },
      },
    ]);

    assert.deepEqual(splitDiffRows([line("del", "old", 1, null), line("add", "new", null, 1)]), [
      {
        left: { kind: "del", number: 1, text: "old" },
        right: { kind: "add", number: 1, text: "new" },
      },
    ]);

    assert.deepEqual(
      splitDiffRows([
        line("del", "a", 1, null),
        line("del", "b", 2, null),
        line("add", "c", null, 1),
      ]),
      [
        {
          left: { kind: "del", number: 1, text: "a" },
          right: { kind: "add", number: 1, text: "c" },
        },
        {
          left: { kind: "del", number: 2, text: "b" },
          right: null,
        },
      ],
    );

    assert.deepEqual(splitDiffRows([line("add", "only", null, 1)]), [
      { left: null, right: { kind: "add", number: 1, text: "only" } },
    ]);
  });
});
