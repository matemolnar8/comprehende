import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { highlightSource, languageFromPath } from "./highlight.ts";

describe("highlight", () => {
  it("maps json configs and highlights keys", () => {
    assert.equal(languageFromPath(".eslintrc.json"), "json");
    const html = highlightSource(`{\n  "rules": {}\n}`, "json");
    assert.match(html, /hljs-attr/);
    assert.doesNotMatch(html, /&lt;script/);
  });

  it("escapes unknown languages", () => {
    assert.equal(highlightSource("<raw>", "plaintext"), "&lt;raw&gt;");
  });
});
