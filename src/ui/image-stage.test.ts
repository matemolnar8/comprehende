import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fitImageStage, stageCaption } from "./lib/image-stage.ts";

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

describe("stageCaption", () => {
  it("states native size, and the scale only when shrunk", () => {
    assert.equal(stageCaption(320, 180, 1), "320 × 180");
    assert.equal(stageCaption(320, 180, 0.5), "320 × 180 at 50%");
  });
});
