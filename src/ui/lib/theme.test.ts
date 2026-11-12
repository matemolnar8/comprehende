import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import {
  nextThemePreference,
  parseThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme.ts";

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

  it("cycles auto, the theme opposite to the OS, the OS theme, then auto", () => {
    const cycle = (system: ResolvedTheme) => {
      const steps: ThemePreference[] = ["auto"];
      for (let click = 0; click < 3; click++) {
        steps.push(nextThemePreference(steps[steps.length - 1] ?? "auto", system));
      }
      return steps;
    };
    assert.deepEqual(cycle("dark"), ["auto", "light", "dark", "auto"]);
    assert.deepEqual(cycle("light"), ["auto", "dark", "light", "auto"]);
  });
});
