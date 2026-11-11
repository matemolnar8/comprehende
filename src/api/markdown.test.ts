import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { fenceInfos, fenceLanguage, isMarkdownPath } from "./markdown.ts";

describe("isMarkdownPath", () => {
  it("takes Markdown files and leaves MDX as source", () => {
    assert.equal(isMarkdownPath("skills/x/SKILL.md"), true);
    assert.equal(isMarkdownPath("docs/NOTES.MARKDOWN"), true);
    assert.equal(isMarkdownPath(".cursor/rules/a.mdc"), true);
    assert.equal(isMarkdownPath("page.mdx"), false);
    assert.equal(isMarkdownPath("md.ts"), false);
  });
});

describe("fenceInfos", () => {
  it("lists the names on the fences, in a list and in a quote too", () => {
    const source = [
      "---",
      "name: a",
      "---",
      "```ts",
      "```",
      "1. item",
      "   ~~~python title=x",
      "   ~~~",
      "> ```sh",
      "> ```",
    ].join("\n");
    assert.deepEqual(fenceInfos(source), ["yaml", "ts", "python", "sh"]);
  });
});

describe("fenceLanguage", () => {
  const lookup = { ts: "typescript", py: "python", json: "json" };

  it("reads a file extension and a language name", () => {
    assert.equal(fenceLanguage("ts", lookup), "typescript");
    assert.equal(fenceLanguage("TypeScript", lookup), "typescript");
    assert.equal(fenceLanguage("json", lookup), "json");
  });

  it("has no language for a name the highlighter does not know", () => {
    assert.equal(fenceLanguage("mermaidish", lookup), undefined);
  });
});
