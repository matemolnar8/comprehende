import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseThemePreference, resolveTheme } from "./lib/theme.ts";

describe("theme preference", () => {
  it("treats missing or unknown values as system", () => {
    assert.equal(parseThemePreference(null), "system");
    assert.equal(parseThemePreference(""), "system");
    assert.equal(parseThemePreference("dim"), "system");
  });

  it("accepts stored light, dark, and system", () => {
    assert.equal(parseThemePreference("light"), "light");
    assert.equal(parseThemePreference("dark"), "dark");
    assert.equal(parseThemePreference("system"), "system");
  });

  it("follows the OS when preference is system", () => {
    assert.equal(resolveTheme("system", true), "dark");
    assert.equal(resolveTheme("system", false), "light");
  });

  it("keeps an explicit preference over the OS", () => {
    assert.equal(resolveTheme("light", true), "light");
    assert.equal(resolveTheme("dark", false), "dark");
  });
});
