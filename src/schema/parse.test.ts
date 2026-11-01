import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it } from "vite-plus/test";
import { parseReviewDocument, parseReviewJson } from "./parse.ts";
import { legacyLookForErrors } from "./review.ts";
import { reviewFileBody, storedDocument } from "../review/write.ts";
import { skillPaths } from "./skill-paths.ts";
import { findPackageRoot } from "../package-root.ts";
import { addedSymbols, hunkRangeLabel } from "./hunk-meta.ts";

describe("parseReviewDocument", () => {
  it("normalizes path strings and compact hunk refs", () => {
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
          hunkRefs: ["src/app.ts", "src/cli/main.ts@1+8", "src/util.ts -> src/helpers.ts@4+4"],
        },
      ],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.document.groups[0]?.hunkRefs, [
        { path: "src/app.ts" },
        { path: "src/cli/main.ts", oldStart: 1, newStart: 8 },
        { path: "src/helpers.ts", oldPath: "src/util.ts", oldStart: 4, newStart: 4 },
      ]);
    }
  });

  it("rejects a compact ref with an empty path and a hunk object", () => {
    const base = {
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
    };
    const group = {
      id: "g1",
      title: "CLI",
      why: "The command is how an agent starts a review.",
      summary: "Adds a command.",
      suggestedOrder: 0,
    };
    const empty = parseReviewDocument({ ...base, groups: [{ ...group, hunkRefs: ["@1+2"] }] });
    assert.equal(empty.ok, false);
    if (!empty.ok) {
      assert.match(
        empty.errors.join("\n"),
        /hunkRefs\[0\] must be a path, dir\/, or path@oldStart\+newStart/,
      );
    }
    const object = parseReviewDocument({
      ...base,
      groups: [
        {
          ...group,
          hunkRefs: [{ path: "src/app.ts", oldStart: 1, oldLines: 2, newStart: 1, newLines: 3 }],
        },
      ],
    });
    assert.equal(object.ok, false);
    if (!object.ok) {
      assert.match(object.errors.join("\n"), /hunkRefs\[0\] must be a string/);
    }
    const number = parseReviewDocument({ ...base, groups: [{ ...group, hunkRefs: [1] }] });
    assert.equal(number.ok, false);
    if (!number.ok) {
      assert.match(number.errors.join("\n"), /hunkRefs\[0\] must be a string/);
    }
  });

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
          attention: { kind: "contract", note: "`--data` is now required." },
          suggestedOrder: 0,
          hunkRefs: ["src/cli/main.ts@1+8"],
        },
      ],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.document.title, "Review command");
      assert.equal(result.document.why, "Split the review document from live git.");
      assert.equal(result.document.summary, "Adds a review command.");
      assert.equal(result.document.groups[0]?.why, "The command is how an agent starts a review.");
      assert.deepEqual(result.document.lookFor, undefined);
    }
  });

  it("rejects an attention kind outside the four", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "t",
      summary: "s",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "w",
          summary: "s",
          attention: { kind: "nit", note: "opts is a vague name." },
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors.join("\n"), /attention\.kind must be one of contract, tradeoff/);
    }
  });

  it("accepts up to 2 questions and rejects a third", () => {
    const withQuestions = (questions: unknown) =>
      parseReviewDocument({
        version: 1,
        source: { baseRef: "main", headRef: "HEAD" },
        size: "small",
        title: "t",
        summary: "s",
        groups: [
          {
            id: "g1",
            title: "CLI",
            why: "w",
            summary: "s",
            questions,
            suggestedOrder: 0,
            hunkRefs: [],
          },
        ],
      });
    const two = withQuestions(["Why `Lax`?", "Why no `Max-Age`?"]);
    assert.equal(two.ok, true);
    if (two.ok) {
      assert.deepEqual(two.document.groups[0]?.questions, ["Why `Lax`?", "Why no `Max-Age`?"]);
    }
    const three = withQuestions(["a?", "b?", "c?"]);
    assert.equal(three.ok, false);
    if (!three.ok) {
      assert.match(
        three.errors.join("\n"),
        /questions must be an array of at most 2 non-empty strings/,
      );
    }
    const blank = withQuestions(["a?", " "]);
    assert.equal(blank.ok, false);
  });

  it("rejects a backwards or long focus range and a fourth note", () => {
    const note = { path: "a.ts", side: "new", line: 3, body: "n" };
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "t",
      summary: "s",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "w",
          summary: "s",
          focus: [
            { path: "a.ts", side: "new", start: 9, end: 8, caption: "c" },
            { path: "a.ts", side: "new", start: 1, end: 26, caption: "c" },
            { path: "a.ts", side: "new", start: 1, end: 25, caption: "c" },
            { path: "a.ts", side: "left", start: 1, end: 2, caption: "c" },
          ],
          notes: [note, note, note, note],
          suggestedOrder: 0,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      const text = result.errors.join("\n");
      assert.match(text, /focus\[0\]\.end.*must not be before start/);
      assert.match(text, /focus\[1\]\.end.*range spans 26 lines; at most 25/);
      assert.doesNotMatch(text, /focus\[2\]/);
      assert.match(text, /focus\[3\]\.side.*must be old or new/);
      assert.match(text, /notes.*must hold at most 3 notes/);
    }
  });

  it("loads legacy group lookFor, flags it, and writes it back", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "t",
      summary: "s",
      groups: [
        {
          id: "g1",
          title: "CLI",
          why: "w",
          summary: "s",
          lookFor: ["Breaking. `--data` is now required."],
          suggestedOrder: 0,
          hunkRefs: [],
        },
        { id: "g2", title: "Docs", why: "w", summary: "s", suggestedOrder: 1, hunkRefs: [] },
      ],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.document.groups[0]?.legacyLookFor, [
        "Breaking. `--data` is now required.",
      ]);
      assert.deepEqual(legacyLookForErrors(result.document), [
        'groups id "g1" has lookFor; write its one judgment call as attention, or drop it',
      ]);
      const stored = storedDocument(result.document).groups[0];
      assert.equal(stored !== undefined && "legacyLookFor" in stored, false);
      const written = JSON.parse(reviewFileBody(result.document)) as {
        groups: { lookFor?: string[] }[];
      };
      assert.deepEqual(written.groups[0]?.lookFor, ["Breaking. `--data` is now required."]);
      assert.equal(written.groups[1]?.lookFor, undefined);
    }
  });

  it("accepts document lookFor", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      lookFor: [
        "[#24](source:s1) asked for a pasteable prompt. The copy control is on overview and group.",
      ],
      sources: [{ id: "s1", kind: "ticket", label: "#24" }],
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
      assert.equal(result.document.lookFor?.length, 1);
    }
  });

  it("accepts a part name on a group when parts[] matches", () => {
    const result = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      parts: [{ name: "Flags", summary: "Adds CLI flags for the review command." }],
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
        {
          id: "g2",
          title: "Help text",
          why: "The flag names belong in the help text.",
          summary: "Documents the new flags.",
          part: "Flags",
          suggestedOrder: 1,
          hunkRefs: [],
        },
      ],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.document.groups[0]?.part, "Flags");
      assert.equal(result.document.parts?.[0]?.summary, "Adds CLI flags for the review command.");
    }
  });

  it("rejects a named group part with no parts[] entry", () => {
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
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors.join("\n"), /part "Flags" has no matching parts\[\] entry/);
    }
  });

  it("rejects an unused parts[] name, a duplicate name, and an empty summary", () => {
    const group = {
      id: "g1",
      title: "CLI",
      why: "The command is how an agent starts a review.",
      summary: "Adds a command.",
      part: "Flags",
      suggestedOrder: 0,
      hunkRefs: [],
    };
    const base = {
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
    };
    const unused = parseReviewDocument({
      ...base,
      parts: [{ name: "Orphan", summary: "This story is not in any group." }],
      groups: [{ ...group, part: undefined }],
    });
    assert.equal(unused.ok, false);
    if (!unused.ok) {
      assert.match(unused.errors.join("\n"), /parts name "Orphan" is not used by any group/);
    }

    const dup = parseReviewDocument({
      ...base,
      parts: [
        { name: "Flags", summary: "Adds CLI flags." },
        { name: "Flags", summary: "Adds CLI flags again." },
      ],
      groups: [group],
    });
    assert.equal(dup.ok, false);
    if (!dup.ok) {
      assert.match(dup.errors.join("\n"), /duplicate parts name "Flags"/);
    }

    const empty = parseReviewDocument({
      ...base,
      parts: [{ name: "Flags", summary: "   " }],
      groups: [group],
    });
    assert.equal(empty.ok, false);
    if (!empty.ok) {
      assert.match(empty.errors.join("\n"), /parts\[0\]\.summary must be a non-empty string/);
    }
  });

  it("accepts the skill example document", async () => {
    const md = await readFile(
      join(skillPaths(findPackageRoot()).nextSkill, "references/example.md"),
      "utf8",
    );
    const match = md.match(/```json\n([\s\S]*?)\n```/);
    assert.ok(match?.[1]);
    const result = parseReviewJson(match[1]);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.document.parts?.length, 2);
      assert.equal(result.document.parts?.[0]?.name, "Session cookie");
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

    const citation = parseReviewDocument({
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
      why: "See [#24](source:missing).",
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
    assert.equal(citation.ok, false);
    if (!citation.ok) {
      assert.match(citation.errors.join("\n"), /unknown id "missing"/);
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
      sources: [
        { id: "t1", kind: "transcript", label: "Cursor session", url: "https://example.test" },
      ],
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

  it("rejects dependsOn across parts", () => {
    const base = {
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
    } as const;
    const group = {
      title: "A",
      why: "Enables later groups.",
      summary: "Adds a command.",
      suggestedOrder: 0,
      hunkRefs: [],
    };
    const crossed = parseReviewDocument({
      ...base,
      parts: [
        { name: "shell", summary: "The mobile shell." },
        { name: "styles", summary: "The compact styles." },
      ],
      groups: [
        { ...group, id: "foundation", part: "styles" },
        { ...group, id: "shell", title: "B", part: "shell", dependsOn: ["foundation"] },
      ],
    });
    assert.equal(crossed.ok, false);
    if (!crossed.ok) {
      assert.match(crossed.errors.join("\n"), /dependsOn "foundation" across parts/);
    }

    const samePart = parseReviewDocument({
      ...base,
      parts: [{ name: "shell", summary: "The mobile shell." }],
      groups: [
        { ...group, id: "foundation", part: "shell" },
        { ...group, id: "shell", title: "B", part: "shell", dependsOn: ["foundation"] },
      ],
    });
    assert.equal(samePart.ok, true);
  });

  it("rejects single-field shape errors", () => {
    const groupBase = {
      id: "g1",
      title: "CLI",
      why: "The command is how an agent starts a review.",
      summary: "Adds a command.",
      suggestedOrder: 0,
      hunkRefs: [],
    };
    const docBase = {
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title: "Review command",
      summary: "Adds a review command.",
    };
    const cases: Array<{ name: string; input: unknown; match?: RegExp }> = [
      {
        name: "missing size",
        input: { ...docBase, size: undefined, groups: [] },
        match: /size must be one of/,
      },
      {
        name: "unknown size",
        input: { ...docBase, size: "huge", groups: [] },
        match: /size must be one of/,
      },
      {
        name: "missing group why",
        input: {
          ...docBase,
          groups: [
            { id: "g1", title: "CLI", summary: "Adds a command.", suggestedOrder: 0, hunkRefs: [] },
          ],
        },
        match: /groups\[0\]\.why must be a string/,
      },
      {
        name: "missing document title",
        input: { ...docBase, title: undefined, groups: [groupBase] },
        match: /title must be a string/,
      },
      {
        name: "missing document summary",
        input: { ...docBase, summary: undefined, groups: [groupBase] },
        match: /summary must be a string/,
      },
      {
        name: "empty group why",
        input: { ...docBase, groups: [{ ...groupBase, why: "   " }] },
        match: /groups\[0\]\.why must be a non-empty string/,
      },
      {
        name: "unknown walkthrough field",
        input: {
          ...docBase,
          walkthrough: "Stop per-song lookups from flooding the API.",
          groups: [groupBase],
        },
        match: /unknown field "walkthrough"/,
      },
    ];
    for (const { name, input, match } of cases) {
      const result = parseReviewDocument(input);
      assert.equal(result.ok, false, name);
      if (!result.ok && match) {
        assert.match(result.errors.join("\n"), match, name);
      }
    }
  });
});

describe("hunk-meta", () => {
  it("reads added symbols", () => {
    assert.deepEqual(
      addedSymbols([
        "export function createInvitation() {",
        "const x = 1",
        "export type Id = string",
      ]),
      ["createInvitation", "Id"],
    );
  });

  it("reads @@ range label without context prose", () => {
    assert.equal(
      hunkRangeLabel(
        "@@ -19,6 +19,10 @@ Composer 2.5: Cheap model, preferred to use when possible for: low complexity si",
      ),
      "@@ -19,6 +19,10 @@",
    );
  });
});
