import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { nextMonoFont, parseMonoFont } from "./mono-font.ts";

describe("mono font preference", () => {
  it("treats missing or unknown values as plex", () => {
    assert.equal(parseMonoFont(null), "plex");
    assert.equal(parseMonoFont(""), "plex");
    assert.equal(parseMonoFont("plex"), "plex");
    assert.equal(parseMonoFont("courier"), "plex");
  });

  it("accepts stored iosevka", () => {
    assert.equal(parseMonoFont("iosevka"), "iosevka");
  });

  it("toggles between the two fonts", () => {
    assert.equal(nextMonoFont("plex"), "iosevka");
    assert.equal(nextMonoFont("iosevka"), "plex");
  });
});
