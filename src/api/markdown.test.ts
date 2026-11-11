import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import {
  fenceInfos,
  fenceLanguage,
  imageTargets,
  isMarkdownPath,
  repositoryPath,
} from "./markdown.ts";

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

describe("imageTargets", () => {
  it("lists the addresses of Markdown images, HTML images, and link definitions", () => {
    const source = [
      '![One](docs/one.png) and ![Two](<img/two.png> "title")',
      '<p align="center"><img width="96" src="logo.png" alt="Logo"></p>',
      "![Three][three]",
      "",
      "[three]: ../three.png",
    ].join("\n");
    assert.deepEqual(imageTargets(source), [
      "docs/one.png",
      "img/two.png",
      "logo.png",
      "../three.png",
    ]);
  });
});

describe("repositoryPath", () => {
  it("reads an address from the folder of the file that holds it", () => {
    assert.equal(repositoryPath("img/a.png", "docs/guide/x.md"), "docs/guide/img/a.png");
    assert.equal(repositoryPath("../img/a.png?raw=1#top", "docs/guide/x.md"), "docs/img/a.png");
    assert.equal(repositoryPath("/assets/a.png", "docs/guide/x.md"), "assets/a.png");
    assert.equal(repositoryPath("my%20shots/100%.png", "README.md"), "my shots/100%.png");
  });

  it("does not leave the repository", () => {
    assert.equal(repositoryPath("../../../etc/a.png", "docs/x.md"), "etc/a.png");
    assert.equal(repositoryPath("https://example.com/a.png", "docs/x.md"), undefined);
    assert.equal(repositoryPath("//example.com/a.png", "docs/x.md"), undefined);
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
