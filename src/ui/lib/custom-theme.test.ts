import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { parsePalette, pickPalette } from "./custom-theme.ts";

const both = [{ source: "project" }, { source: "user" }] as const;

describe("pickPalette", () => {
  it("starts on the project theme, else the user theme, else the built-in colours", () => {
    assert.equal(pickPalette(both, undefined), "project");
    assert.equal(pickPalette([{ source: "user" }], undefined), "user");
    assert.equal(pickPalette([], undefined), "default");
  });

  it("keeps the stored palette when the review has it", () => {
    assert.equal(pickPalette(both, "user"), "user");
    assert.equal(pickPalette(both, "default"), "default");
  });

  it("falls back when the review has no theme for the stored palette", () => {
    assert.equal(pickPalette([{ source: "project" }], "user"), "project");
    assert.equal(pickPalette([], "project"), "default");
  });
});

describe("parsePalette", () => {
  it("leaves an unknown value unset", () => {
    assert.equal(parsePalette(null), undefined);
    assert.equal(parsePalette("blue"), undefined);
    assert.equal(parsePalette("user"), "user");
  });
});
