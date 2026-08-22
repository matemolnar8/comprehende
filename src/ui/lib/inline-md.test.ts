import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flattenInline, parseInline, type InlineNode } from "./inline-md.ts";

describe("flattenInline", () => {
  it("collapses newlines and extra space to one line", () => {
    assert.equal(flattenInline("Keep cache.\n\nKeyed by ids.\n"), "Keep cache. Keyed by ids.");
  });

  it("trims the ends", () => {
    assert.equal(flattenInline("  hello  "), "hello");
  });
});

describe("parseInline", () => {
  it("turns backtick symbols into code spans", () => {
    assert.deepEqual(parseInline("The cache is `WorkerOutputCache`."), [
      { type: "text", value: "The cache is " },
      { type: "code", value: "WorkerOutputCache" },
      { type: "text", value: "." },
    ]);
  });

  it("keeps nested backticks inside a longer run", () => {
    assert.deepEqual(parseInline("See `` `entryReferenceIds` ``."), [
      { type: "text", value: "See " },
      { type: "code", value: "`entryReferenceIds`" },
      { type: "text", value: "." },
    ]);
  });

  it("leaves unmatched backticks as text", () => {
    assert.deepEqual(parseInline("open `WorkerOutputCache"), [{ type: "text", value: "open `WorkerOutputCache" }]);
  });

  it("does not treat underscores in identifiers as emphasis", () => {
    assert.deepEqual(parseInline("Keyed by entry_reference_ids and __VITE_WORKER_ASSET__."), [
      { type: "text", value: "Keyed by entry_reference_ids and __VITE_WORKER_ASSET__." },
    ]);
  });

  it("renders *em* and **strong**", () => {
    assert.deepEqual(parseInline("A *subtle* risk, **breaking** if the URL changes."), [
      { type: "text", value: "A " },
      { type: "em", children: [{ type: "text", value: "subtle" }] },
      { type: "text", value: " risk, " },
      { type: "strong", children: [{ type: "text", value: "breaking" }] },
      { type: "text", value: " if the URL changes." },
    ]);
  });

  it("parses emphasis inside strong", () => {
    assert.deepEqual(parseInline("**keep *this* intact**"), [
      {
        type: "strong",
        children: [
          { type: "text", value: "keep " },
          { type: "em", children: [{ type: "text", value: "this" }] },
          { type: "text", value: " intact" },
        ],
      },
    ]);
  });

  it("parses code inside strong", () => {
    assert.deepEqual(parseInline("**see `WorkerOutputCache`**"), [
      {
        type: "strong",
        children: [
          { type: "text", value: "see " },
          { type: "code", value: "WorkerOutputCache" },
        ],
      },
    ]);
  });

  it("leaves unmatched emphasis markers as text", () => {
    assert.deepEqual(parseInline("half *open"), [{ type: "text", value: "half *open" }]);
  });

  it("honors backslash escapes for backticks and stars", () => {
    assert.deepEqual(parseInline("show \\`ticks\\` and \\*stars\\*"), [
      { type: "text", value: "show `ticks` and *stars*" },
    ]);
  });

  it("keeps heading, list, and quote markers as text on one line", () => {
    const source = ["# Not a heading", "", "- not a list", "> not a quote"].join("\n");
    assert.deepEqual(parseInline(source), [{ type: "text", value: "# Not a heading - not a list > not a quote" }]);
  });

  it("keeps HTML as text", () => {
    assert.deepEqual(parseInline("<strong>no html</strong>"), [{ type: "text", value: "<strong>no html</strong>" }]);
  });

  it("turns a fenced block into one inline code span, not a pre stack", () => {
    const source = ["Keep `WorkerOutputCache`.", "```", "function x() {}", "```", "Done."].join("\n");
    assert.deepEqual(parseInline(source), [
      { type: "text", value: "Keep " },
      { type: "code", value: "WorkerOutputCache" },
      { type: "text", value: ". " },
      { type: "code", value: "function x() {}" },
      { type: "text", value: " Done." },
    ]);
    assert.equal(
      parseInline(source).every((node) => node.type === "text" || node.type === "code"),
      true,
    );
  });

  it("returns no nodes for blank input", () => {
    assert.deepEqual(parseInline("  \n\t  "), []);
  });

  it("only yields inline node kinds", () => {
    const source = "# Title\n\n```\npre\n```\n**bold** and *em* and `code`";
    for (const node of walk(parseInline(source))) {
      assert.ok(node.type === "text" || node.type === "code" || node.type === "em" || node.type === "strong");
    }
  });
});

function walk(nodes: InlineNode[]): InlineNode[] {
  const out: InlineNode[] = [];
  for (const node of nodes) {
    out.push(node);
    if (node.type === "em" || node.type === "strong") {
      out.push(...walk(node.children));
    }
  }
  return out;
}
