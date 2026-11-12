import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { runViewTransition, selectionMotion } from "./motion.ts";
import { selectionStack } from "./selection.ts";

describe("runViewTransition", () => {
  it("runs the update directly where the View Transition API is missing", () => {
    const fakeDocument = { documentElement: { dataset: {} } };
    Object.defineProperty(globalThis, "document", { value: fakeDocument, configurable: true });
    try {
      let updates = 0;
      runViewTransition(() => {
        updates += 1;
      }, "group");
      assert.equal(updates, 1);
    } finally {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("starts a transition and marks the motion kind where the API exists", () => {
    const dataset: Record<string, string> = {};
    const fakeDocument = {
      documentElement: { dataset },
      startViewTransition: (callback: () => void) => {
        callback();
        return { finished: new Promise<void>(() => {}) };
      },
    };
    Object.defineProperty(globalThis, "document", { value: fakeDocument, configurable: true });
    try {
      let updates = 0;
      runViewTransition(() => {
        updates += 1;
      }, "scene");
      assert.equal(updates, 1);
      assert.equal(dataset.motion, "scene");
    } finally {
      Reflect.deleteProperty(globalThis, "document");
    }
  });
});

describe("selectionMotion", () => {
  it("skips the group motion on narrow screens and keeps the scene motion", () => {
    assert.equal(selectionMotion({ inspectorOpen: false, narrow: false }), "group");
    assert.equal(selectionMotion({ inspectorOpen: false, narrow: true }), null);
    assert.equal(selectionMotion({ inspectorOpen: true, narrow: true }), "scene");
    assert.equal(selectionMotion({ inspectorOpen: true, narrow: false }), "scene");
  });
});

describe("selectionStack", () => {
  it("includes unassigned only when hunks sit outside groups", () => {
    assert.deepEqual(
      selectionStack({ groups: [{ id: "a" }], unassigned: { hunkCount: 0 } }).map(
        (item) => item.kind,
      ),
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
