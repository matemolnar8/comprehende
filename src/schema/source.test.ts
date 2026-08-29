import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  citationIds,
  documentCitationRefs,
  isLinePinned,
  parseSourceHref,
  sourceCitationErrors,
  textLineCount,
} from "./source.ts";
import type { ReviewDocument } from "./types.ts";

const group = {
  id: "g1",
  title: "CLI",
  why: "The command exists.",
  summary: "Adds a command.",
  suggestedOrder: 0,
  hunkRefs: [],
};

function doc(over: Partial<ReviewDocument>): ReviewDocument {
  return {
    version: 1,
    source: { baseRef: "main", headRef: "HEAD" },
    size: "small",
    title: "Review command",
    summary: "Adds a review command.",
    groups: [group],
    ...over,
  };
}

describe("citationIds", () => {
  it("reads source: hrefs from markdown links", () => {
    assert.deepEqual(
      citationIds("Reviewers asked for [a cap on retries](source:s2), and [#24](source:s1) tracks the feature."),
      ["s2", "s1"],
    );
  });

  it("ignores ordinary links", () => {
    assert.deepEqual(citationIds("See [the ticket](https://example.test/24)."), []);
  });
});

describe("parseSourceHref", () => {
  it("reads a source id and rejects other schemes", () => {
    assert.equal(parseSourceHref("source:s1"), "s1");
    assert.equal(parseSourceHref("source:"), undefined);
    assert.equal(parseSourceHref("https://example.test"), undefined);
  });
});

describe("sourceCitationErrors", () => {
  it("fails unknown ids and accepts known ones", () => {
    const unknown = doc({
      why: "See [#24](source:s1).",
    });
    assert.match(sourceCitationErrors(unknown).join("\n"), /unknown id "s1" in why/);

    const known = doc({
      why: "See [#24](source:s1).",
      sources: [{ id: "s1", kind: "ticket", label: "#24" }],
    });
    assert.deepEqual(sourceCitationErrors(known), []);
  });

  it("names lookFor locations", () => {
    const result = sourceCitationErrors(
      doc({
        groups: [
          {
            ...group,
            lookFor: ["Check [the flag](source:missing)."],
          },
        ],
      }),
    );
    assert.match(result.join("\n"), /groups\[0\]\.lookFor\[0\]/);
  });
});

describe("documentCitationRefs", () => {
  it("walks document and group prose", () => {
    const refs = documentCitationRefs(
      doc({
        why: "[one](source:s1)",
        summary: "[two](source:s2)",
        groups: [{ ...group, why: "[three](source:s3)", summary: "plain" }],
      }),
    );
    assert.deepEqual(
      refs.map((ref) => `${ref.where}:${ref.id}`),
      ["why:s1", "summary:s2", "groups[0].why:s3"],
    );
  });
});

describe("isLinePinned", () => {
  it("requires path, side, and line on a pr-comment", () => {
    assert.equal(
      isLinePinned({
        id: "s2",
        kind: "pr-comment",
        label: "alice",
        author: "alice",
        body: "cap retries",
        path: "src/cli/main.ts",
        side: "new",
        line: 12,
      }),
      true,
    );
    assert.equal(
      isLinePinned({
        id: "s2",
        kind: "pr-comment",
        label: "alice",
        author: "alice",
        body: "a conversation comment",
      }),
      false,
    );
  });
});

describe("textLineCount", () => {
  it("counts lines the way git files are stored", () => {
    assert.equal(textLineCount(""), 0);
    assert.equal(textLineCount("a\n"), 1);
    assert.equal(textLineCount("a\nb\n"), 2);
    assert.equal(textLineCount("a\nb"), 2);
  });
});
