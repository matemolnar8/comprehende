import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { initialRailCollapsed, repeatedNameFolders, scrollDeltaToShow } from "./file-nav.ts";

describe("initialRailCollapsed", () => {
  it("follows the rail query before a stored choice or the width", () => {
    assert.equal(initialRailCollapsed("?rail=collapsed", false, false), true);
    assert.equal(initialRailCollapsed("?other=1&rail=open", true, true), false);
  });

  it("uses a stored choice when the query is absent", () => {
    assert.equal(initialRailCollapsed("", false, true), false);
    assert.equal(initialRailCollapsed("?rail=side", true, false), true);
  });

  it("starts collapsed under the narrow rail width when nothing is stored", () => {
    assert.equal(initialRailCollapsed("", null, true), true);
    assert.equal(initialRailCollapsed("", null, false), false);
  });
});

describe("repeatedNameFolders", () => {
  it("names the parent folder only for a basename that repeats", () => {
    assert.deepEqual(
      repeatedNameFolders(["e2e/living-room.ts", "e2e/seed/living-room.ts", "src/app.ts"]),
      ["e2e/", "seed/", undefined],
    );
  });

  it("gives a root-level file no folder", () => {
    assert.deepEqual(repeatedNameFolders(["README.md", "docs/README.md"]), [undefined, "docs/"]);
  });
});

describe("scrollDeltaToShow", () => {
  const view = { top: 100, bottom: 300 };

  it("does not move when the row is in view", () => {
    assert.equal(scrollDeltaToShow(view, { top: 120, bottom: 150 }), 0);
  });

  it("moves the least distance to show a row above or below", () => {
    assert.equal(scrollDeltaToShow(view, { top: 80, bottom: 110 }), -20);
    assert.equal(scrollDeltaToShow(view, { top: 290, bottom: 320 }), 20);
  });

  it("keeps the top of a row that is taller than the view", () => {
    assert.equal(scrollDeltaToShow(view, { top: 350, bottom: 600 }), 250);
  });

  it("stops on a row top when it scrolls down", () => {
    const tops = [60, 100, 140, 180, 220, 260, 300];
    assert.equal(scrollDeltaToShow(view, { top: 300, bottom: 340 }, tops), 40);
    assert.equal(scrollDeltaToShow(view, { top: 290, bottom: 320 }, [70, 110, 150, 290]), 50);
  });

  it("keeps the row top when no row top in between shows it", () => {
    assert.equal(scrollDeltaToShow(view, { top: 290, bottom: 320 }, [80, 290]), 190);
  });
});
