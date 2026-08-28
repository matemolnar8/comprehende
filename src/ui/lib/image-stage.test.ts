import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fitImageStage, fitTwoColumnStage, stageCaption, wipeOverlayWidth } from "./image-stage.ts";

describe("fitImageStage", () => {
  it("keeps native pixels when the image fits", () => {
    assert.deepEqual(fitImageStage(320, 180, 900, 800), { width: 320, height: 180, scale: 1 });
  });

  it("scales down to the box and never upscales", () => {
    assert.deepEqual(fitImageStage(320, 180, 160, 800), { width: 160, height: 90, scale: 0.5 });
    assert.deepEqual(fitImageStage(100, 100, 400, 400), { width: 100, height: 100, scale: 1 });
  });

  it("returns an empty stage until the host is measured", () => {
    assert.deepEqual(fitImageStage(320, 180, 0, 800), { width: 0, height: 0, scale: 1 });
  });
});

describe("fitTwoColumnStage", () => {
  it("keeps two native panes when they already fit", () => {
    const pane = fitTwoColumnStage(320, 180, 900, 800);
    assert.deepEqual(pane, { width: 320, height: 180, scale: 1 });
    assert.ok(pane.width * 2 + 1 <= 900);
  });

  it("scales 1920 × 1080 so two columns stay in the host", () => {
    const pane = fitTwoColumnStage(1920, 1080, 1000, 800);
    assert.equal(pane.width, 499);
    assert.equal(pane.height, 281);
    assert.ok(pane.width * 2 + 1 <= 1000);
    assert.ok(pane.scale < 1);
  });
});

describe("stageCaption", () => {
  it("states native size, and the scale only when shrunk", () => {
    assert.equal(stageCaption(320, 180, 1), "320 × 180");
    assert.equal(stageCaption(320, 180, 0.5), "320 × 180 at 50%");
  });
});

describe("wipeOverlayWidth", () => {
  it("reveals new from the left as wipe moves toward New", () => {
    assert.equal(wipeOverlayWidth(0), "0%");
    assert.equal(wipeOverlayWidth(25), "25%");
    assert.equal(wipeOverlayWidth(100), "100%");
  });
});
