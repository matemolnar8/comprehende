import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseThemePreference, resolveTheme } from "./lib/theme.ts";

describe("theme preference", () => {
  it("treats missing or unknown values as auto", () => {
    assert.equal(parseThemePreference(null), "auto");
    assert.equal(parseThemePreference(""), "auto");
    assert.equal(parseThemePreference("dim"), "auto");
  });

  it("accepts stored light, dark, and auto", () => {
    assert.equal(parseThemePreference("light"), "light");
    assert.equal(parseThemePreference("dark"), "dark");
    assert.equal(parseThemePreference("auto"), "auto");
  });

  it("migrates legacy system value to auto", () => {
    assert.equal(parseThemePreference("system"), "auto");
  });

  it("follows the OS when preference is auto", () => {
    assert.equal(resolveTheme("auto", true), "dark");
    assert.equal(resolveTheme("auto", false), "light");
  });

  it("keeps an explicit preference over the OS", () => {
    assert.equal(resolveTheme("light", true), "light");
    assert.equal(resolveTheme("dark", false), "dark");
  });
});
