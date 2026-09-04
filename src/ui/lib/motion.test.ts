import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldViewTransition } from "./motion.ts";
import { selectionStack } from "./selection.ts";

describe("shouldViewTransition", () => {
  it("needs motion allowed and the View Transition API", () => {
    const cases: Array<[{ reducedMotion: boolean; startViewTransition: (() => undefined) | undefined }, boolean]> = [
      [{ reducedMotion: true, startViewTransition: () => undefined }, false],
      [{ reducedMotion: false, startViewTransition: undefined }, false],
      [{ reducedMotion: false, startViewTransition: () => undefined }, true],
    ];
    for (const [options, expected] of cases) {
      assert.equal(shouldViewTransition(options), expected);
    }
  });
});

describe("selectionStack", () => {
  it("includes unassigned only when hunks sit outside groups", () => {
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
