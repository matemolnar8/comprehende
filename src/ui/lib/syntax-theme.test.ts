import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { recolorTheme } from "./syntax-theme.ts";

describe("recolorTheme", () => {
  it("repaints each rule once from its original colour and keeps numbers coloured", () => {
    const theme = {
      name: "base",
      tokenColors: [
        { scope: "keyword", settings: { foreground: "#D73A49" } },
        { scope: "entity", settings: { foreground: "#6f42c1" } },
        { scope: "string", settings: { foreground: "#032f62" } },
      ],
    };
    const out = recolorTheme(theme, "next", {
      colors: { "#d73a49": "#6f42c1", "#6f42c1": "#24292e" },
      number: "#005cc5",
    });
    assert.equal(out.name, "next");
    assert.deepEqual(
      out.tokenColors?.map((rule) => [rule.scope, rule.settings.foreground]),
      [
        ["keyword", "#6f42c1"],
        ["entity", "#24292e"],
        ["string", "#032f62"],
        ["constant.numeric", "#005cc5"],
      ],
    );
    assert.equal(theme.tokenColors[0]?.settings.foreground, "#D73A49");
  });
});
