import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldViewTransition } from "./lib/motion.ts";
import { selectionStack } from "./lib/selection.ts";

describe("shouldViewTransition", () => {
  it("is off when the user prefers reduced motion", () => {
    assert.equal(shouldViewTransition({ reducedMotion: true, startViewTransition: () => undefined }), false);
  });

  it("is off when the browser has no View Transition API", () => {
    assert.equal(shouldViewTransition({ reducedMotion: false, startViewTransition: undefined }), false);
  });

  it("is on when motion is allowed and the API exists", () => {
    assert.equal(shouldViewTransition({ reducedMotion: false, startViewTransition: () => undefined }), true);
  });
});

describe("selectionStack", () => {
  it("includes unassigned only when hunks sit outside layers", () => {
    assert.deepEqual(
      selectionStack({ groups: [{ id: "a" }], unassigned: { hunkCount: 0 } }).map((item) => item.kind),
      ["overview", "group"],
    );
  });

  it("includes lockfiles when the live diff has them", () => {
    assert.deepEqual(
      selectionStack({
        groups: [{ id: "a" }],
        unassigned: { hunkCount: 0 },
        lockfiles: { fileCount: 2 },
      }).map((item) => item.kind),
      ["overview", "group", "lockfiles"],
    );
  });
});
