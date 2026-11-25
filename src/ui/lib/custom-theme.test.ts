import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { parseThemeChoice, pickThemeChoice } from "./custom-theme.ts";

const both = [{ source: "project" }, { source: "user" }] as const;

describe("pickThemeChoice", () => {
  it("starts on the project theme, else the user theme, else the built-in colours", () => {
    assert.equal(pickThemeChoice(both, undefined), "project");
    assert.equal(pickThemeChoice([{ source: "user" }], undefined), "user");
    assert.equal(pickThemeChoice([], undefined), "default");
  });

  it("keeps the stored themeChoice when the review has it", () => {
    assert.equal(pickThemeChoice(both, "user"), "user");
    assert.equal(pickThemeChoice(both, "default"), "default");
  });

  it("falls back when the review has no theme for the stored themeChoice", () => {
    assert.equal(pickThemeChoice([{ source: "project" }], "user"), "project");
    assert.equal(pickThemeChoice([], "project"), "default");
  });
});

describe("parseThemeChoice", () => {
  it("leaves an unknown value unset", () => {
    assert.equal(parseThemeChoice(null), undefined);
    assert.equal(parseThemeChoice("blue"), undefined);
    assert.equal(parseThemeChoice("user"), "user");
  });
});
