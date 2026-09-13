import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPlainLeftClick } from "./plain-click.ts";

const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

describe("isPlainLeftClick", () => {
  it("accepts an unmodified left click", () => {
    assert.equal(isPlainLeftClick(plain), true);
  });

  it("rejects modified or non-left clicks", () => {
    assert.equal(isPlainLeftClick({ ...plain, button: 1 }), false);
    assert.equal(isPlainLeftClick({ ...plain, metaKey: true }), false);
    assert.equal(isPlainLeftClick({ ...plain, ctrlKey: true }), false);
    assert.equal(isPlainLeftClick({ ...plain, shiftKey: true }), false);
    assert.equal(isPlainLeftClick({ ...plain, altKey: true }), false);
  });
});
