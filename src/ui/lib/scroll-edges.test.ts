import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { scrollEdges } from "./scroll-edges.ts";

describe("scrollEdges", () => {
  it("shows no edge when the content fits", () => {
    assert.deepEqual(scrollEdges({ offset: 0, view: 400, content: 400 }), {
      scrolled: false,
      more: false,
    });
  });

  it("shows more after the start of a long list", () => {
    assert.deepEqual(scrollEdges({ offset: 0, view: 400, content: 900 }), {
      scrolled: false,
      more: true,
    });
  });

  it("shows only the start edge at the end, with subpixel slack", () => {
    assert.deepEqual(scrollEdges({ offset: 499.5, view: 400, content: 900 }), {
      scrolled: true,
      more: false,
    });
  });

  it("shows both edges in the middle", () => {
    assert.deepEqual(scrollEdges({ offset: 200, view: 400, content: 900 }), {
      scrolled: true,
      more: true,
    });
  });
});
