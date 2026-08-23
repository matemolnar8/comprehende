import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { InlineMd } from "./components/InlineMd.tsx";
import { flattenInline } from "./lib/inline-md.ts";

function html(text: string): string {
  return renderToStaticMarkup(createElement(InlineMd, { text })).replace(/ class="[^"]*"/g, "");
}

describe("flattenInline", () => {
  it("collapses newlines and extra space to one line", () => {
    assert.equal(flattenInline("Keep cache.\n\nKeyed by ids.\n"), "Keep cache. Keyed by ids.");
  });

  it("trims the ends", () => {
    assert.equal(flattenInline("  hello  "), "hello");
  });
});

describe("InlineMd", () => {
  it("turns backtick symbols into code spans", () => {
    assert.equal(html("The cache is `WorkerOutputCache`."), "The cache is <code>WorkerOutputCache</code>.");
  });

  it("puts the chip and strong look on the markdown tags", () => {
    const markup = renderToStaticMarkup(createElement(InlineMd, { text: "A `chip` and **bold**." }));
    assert.match(markup, /<code class="[^"]+">chip<\/code>/);
    assert.match(markup, /<strong class="[^"]+">bold<\/strong>/);
    assert.match(markup, /font-semibold/);
    assert.match(markup, /box-decoration-clone/);
  });

  it("keeps nested backticks inside a longer run", () => {
    assert.equal(html("See `` `entryReferenceIds` ``."), "See <code>`entryReferenceIds`</code>.");
  });

  it("leaves unmatched backticks as text", () => {
    assert.equal(html("open `WorkerOutputCache"), "open `WorkerOutputCache");
  });

  it("leaves dunder names unchanged inside inline code", () => {
    assert.equal(html("Emit `__VITE_WORKER_ASSET__`."), "Emit <code>__VITE_WORKER_ASSET__</code>.");
  });

  it("renders *em* and **strong**", () => {
    assert.equal(
      html("A *subtle* risk, **breaking** if the URL changes."),
      "A <em>subtle</em> risk, <strong>breaking</strong> if the URL changes.",
    );
  });

  it("parses emphasis inside strong", () => {
    assert.equal(html("**keep *this* intact**"), "<strong>keep <em>this</em> intact</strong>");
  });

  it("parses code inside strong", () => {
    assert.equal(html("**see `WorkerOutputCache`**"), "<strong>see <code>WorkerOutputCache</code></strong>");
  });

  it("leaves unmatched emphasis markers as text", () => {
    assert.equal(html("half *open"), "half *open");
  });

  it("honors backslash escapes for backticks and stars", () => {
    assert.equal(html("show \\`ticks\\` and \\*stars\\*"), "show `ticks` and *stars*");
  });

  it("keeps heading, list, and quote content on one line without block tags", () => {
    const source = ["# Not a heading", "", "- not a list", "> not a quote"].join("\n");
    const out = html(source);
    assert.match(out, /Not a heading/);
    assert.match(out, /not a list/);
    assert.match(out, /not a quote/);
    assert.equal(/<h1|<ul|<li|<blockquote|<pre|<p/i.test(out), false);
    assert.equal(out.includes("\n"), false);
  });

  it("ignores HTML tags", () => {
    assert.equal(html("<strong>no html</strong>"), "no html");
  });

  it("turns a fenced block into one inline code span, not a pre stack", () => {
    const source = ["Keep `WorkerOutputCache`.", "```", "function x() {}", "```", "Done."].join("\n");
    assert.equal(html(source), "Keep <code>WorkerOutputCache</code>. <code>function x() {}</code> Done.");
    assert.equal(html(source).includes("<pre"), false);
  });

  it("returns nothing for blank input", () => {
    assert.equal(html("  \n\t  "), "");
  });
});
