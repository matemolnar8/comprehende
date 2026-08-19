import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diffRgba } from "./image-diff.ts";
import { imageMediaType, isImagePath, isLfsPointerText } from "./image.ts";

describe("image helpers", () => {
  it("detects screenshot paths and media types", () => {
    assert.equal(isImagePath("shots/home.png"), true);
    assert.equal(isImagePath("shots/home.PNG"), true);
    assert.equal(isImagePath("assets/dot.bin"), false);
    assert.equal(imageMediaType("a/b.jpg"), "image/jpeg");
  });

  it("detects Git LFS pointer text", () => {
    const pointer = [
      "version https://git-lfs.github.com/spec/v1",
      "oid sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "size 12",
      "",
    ].join("\n");
    assert.equal(isLfsPointerText(pointer), true);
    assert.equal(isLfsPointerText("not a pointer"), false);
  });
});

describe("diffRgba", () => {
  it("counts changed pixels and paints magenta on them", () => {
    const oldPixels = new Uint8ClampedArray([10, 10, 10, 255, 20, 20, 20, 255]);
    const newPixels = new Uint8ClampedArray([10, 10, 10, 255, 200, 20, 20, 255]);
    const diff = diffRgba(oldPixels, newPixels, 2, 1, 8);
    assert.equal(diff.changed, 1);
    assert.equal(diff.total, 2);
    assert.equal(diff.pixels[4], 200);
    assert.equal(diff.pixels[5], 40);
    assert.equal(diff.pixels[6], 160);
  });
});
