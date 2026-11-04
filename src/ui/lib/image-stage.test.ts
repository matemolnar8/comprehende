import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { crispScale, fitImageStage, fitTwoColumnStage, stageScaleLabel } from "./image-stage.ts";

describe("crispScale", () => {
  it("is true only for whole steps above 1×", () => {
    assert.equal(crispScale(2), true);
    assert.equal(crispScale(1.5), false);
    assert.equal(crispScale(1), false);
  });
});

describe("fitImageStage", () => {
  it("keeps native pixels when the image fits", () => {
    assert.deepEqual(fitImageStage(320, 180, 900, 800), { width: 320, height: 180, scale: 1 });
  });

  it("scales down to the box and keeps native size by default", () => {
    assert.deepEqual(fitImageStage(320, 180, 160, 800), { width: 160, height: 90, scale: 0.5 });
    assert.deepEqual(fitImageStage(100, 100, 400, 400), { width: 100, height: 100, scale: 1 });
  });

  it("grows a small image by whole steps from 2× up to maxScale", () => {
    assert.deepEqual(fitImageStage(320, 180, 1000, 800, 2), { width: 640, height: 360, scale: 2 });
    assert.deepEqual(fitImageStage(100, 100, 900, 900, 3), { width: 300, height: 300, scale: 3 });
  });

  it("grows smoothly below 2×", () => {
    assert.deepEqual(fitImageStage(320, 180, 900, 800, 1.5), {
      width: 480,
      height: 270,
      scale: 1.5,
    });
    assert.deepEqual(fitImageStage(320, 180, 400, 800, 2), {
      width: 400,
      height: 225,
      scale: 1.25,
    });
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

  it("leaves the gap between the panes", () => {
    const pane = fitTwoColumnStage(1000, 500, 1012, 800, 12);
    assert.equal(pane.width, 500);
  });
});

describe("stageScaleLabel", () => {
  it("names the shown scale, or actual size at 100%", () => {
    assert.equal(stageScaleLabel(1), "actual size");
    assert.equal(stageScaleLabel(0.75), "shown at 75%");
    assert.equal(stageScaleLabel(2), "shown at 200%");
  });
});
