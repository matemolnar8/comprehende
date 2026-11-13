import assert from "node:assert/strict";
import { afterEach, describe, it, vi } from "vite-plus/test";
import { runViewTransition, selectionMotion, type MotionKind } from "./motion.ts";
import { selectionStack } from "./selection.ts";

describe("runViewTransition", () => {
  const fakeDocument = (startViewTransition?: (callback: () => void) => unknown) => {
    const dataset: Record<string, string> = {};
    return { dataset, document: { documentElement: { dataset }, startViewTransition } };
  };
  const countUpdates = (kind: MotionKind) => {
    let updates = 0;
    runViewTransition(() => {
      updates += 1;
    }, kind);
    return updates;
  };
  const transition = (callback: () => void) => {
    callback();
    return { finished: new Promise<void>(() => {}) };
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("runs the update directly where the View Transition API is missing", () => {
    vi.stubGlobal("document", fakeDocument().document);
    assert.equal(countUpdates("group"), 1);
  });

  it("starts a transition and marks the motion kind where the API exists", () => {
    const fake = fakeDocument(transition);
    vi.stubGlobal("document", fake.document);
    assert.equal(countUpdates("scene"), 1);
    assert.equal(fake.dataset.motion, "scene");
  });

  it("skips the transition when the user prefers reduced motion", () => {
    const fake = fakeDocument(transition);
    vi.stubGlobal("document", fake.document);
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    assert.equal(countUpdates("scene"), 1);
    assert.equal(fake.dataset.motion, undefined);
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
