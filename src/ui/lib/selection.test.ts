import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  groupWalk,
  neighborSelection,
  parseSelection,
  restoreSelection,
  selectionCaption,
  selectionNavLabel,
  selectionStack,
  selectionStorageKey,
  serializeSelection,
  shiftPartSelection,
  shiftSelection,
  type Selection,
  type SelectionStackSource,
} from "./selection.ts";

const source: SelectionStackSource = {
  groups: [{ id: "auth" }, { id: "ui" }],
  unassigned: { hunkCount: 2 },
};

describe("group selection storage", () => {
  it("keys storage by the review range", () => {
    assert.equal(selectionStorageKey("aaa", "bbb"), selectionStorageKey("aaa", "bbb"));
    assert.notEqual(selectionStorageKey("aaa", "bbb"), selectionStorageKey("aaa", "ccc"));
    assert.notEqual(selectionStorageKey("aaa", "bbb"), selectionStorageKey("ccc", "bbb"));
  });

  it("round-trips overview, unassigned, and a group", () => {
    const overview = { kind: "overview" } as const;
    const unassigned = { kind: "unassigned" } as const;
    const lockfiles = { kind: "lockfiles" } as const;
    const group = { kind: "group", id: "auth" } as const;
    assert.deepEqual(parseSelection(serializeSelection(overview)), overview);
    assert.deepEqual(parseSelection(serializeSelection(unassigned)), unassigned);
    assert.deepEqual(parseSelection(serializeSelection(lockfiles)), lockfiles);
    assert.deepEqual(parseSelection(serializeSelection(group)), group);
  });

  it("treats missing or invalid payloads as empty", () => {
    assert.equal(parseSelection(null), null);
    assert.equal(parseSelection(""), null);
    assert.equal(parseSelection("{"), null);
    assert.equal(parseSelection("{\"kind\":\"group\"}"), null);
    assert.equal(parseSelection("{\"kind\":\"other\"}"), null);
  });

  it("restores a stored group when it still exists", () => {
    assert.deepEqual(restoreSelection(source, { kind: "group", id: "ui" }), { kind: "group", id: "ui" });
  });

  it("falls back when the stored group is gone", () => {
    assert.deepEqual(restoreSelection(source, { kind: "group", id: "gone" }), { kind: "overview" });
  });

  it("falls back from unassigned when no leftover hunks remain", () => {
    assert.deepEqual(
      restoreSelection({ groups: [{ id: "auth" }], unassigned: { hunkCount: 0 } }, { kind: "unassigned" }),
      { kind: "overview" },
    );
  });

  it("falls back from lockfiles when none remain", () => {
    assert.deepEqual(
      restoreSelection(
        { groups: [{ id: "auth" }], unassigned: { hunkCount: 0 }, lockfiles: { fileCount: 0 } },
        { kind: "lockfiles" },
      ),
      { kind: "overview" },
    );
  });

  it("names the current selection for the mobile chrome", () => {
    const meta = {
      document: { title: "Pin reviews to SHAs" },
      groups: [
        { id: "auth", title: "Keep the pin at serve time" },
        { id: "ui", title: "Show the resolved range" },
      ],
    } as const;
    assert.deepEqual(selectionCaption(meta, { kind: "overview" }), { title: "Overview" });
    assert.deepEqual(selectionCaption(meta, { kind: "group", id: "ui" }), {
      index: "02",
      title: "Show the resolved range",
    });
    assert.deepEqual(selectionCaption(meta, { kind: "unassigned" }), { title: "Unassigned" });
    assert.deepEqual(selectionCaption(meta, { kind: "lockfiles" }), { title: "Lockfiles" });
  });

  it("names a neighbor for the previous/next control", () => {
    const meta = {
      document: { title: "Pin reviews to SHAs" },
      groups: [
        { id: "auth", title: "Keep the pin at serve time" },
        { id: "ui", title: "Show the resolved range" },
      ],
    } as const;
    assert.equal(selectionNavLabel(meta, { kind: "overview" }), "Overview");
    assert.equal(selectionNavLabel(meta, { kind: "group", id: "ui" }), "02 Show the resolved range");
  });
});

describe("group walk", () => {
  const stacked: SelectionStackSource = {
    groups: [{ id: "auth" }, { id: "ui" }],
    unassigned: { hunkCount: 2 },
    lockfiles: { fileCount: 1 },
  };

  it("walks overview then groups, and leaves buckets off the path", () => {
    assert.deepEqual(groupWalk(stacked), [
      { kind: "overview" },
      { kind: "group", id: "auth" },
      { kind: "group", id: "ui" },
    ]);
  });

  it("steps to the next group and stops at the last one", () => {
    assert.deepEqual(neighborSelection(stacked, { kind: "overview" }, 1), { kind: "group", id: "auth" });
    assert.deepEqual(neighborSelection(stacked, { kind: "group", id: "auth" }, 1), { kind: "group", id: "ui" });
    assert.equal(neighborSelection(stacked, { kind: "group", id: "ui" }, 1), undefined);
  });

  it("steps to the previous group and stops at overview", () => {
    assert.deepEqual(neighborSelection(stacked, { kind: "group", id: "auth" }, -1), { kind: "overview" });
    assert.equal(neighborSelection(stacked, { kind: "overview" }, -1), undefined);
  });

  it("returns from unassigned to the last group", () => {
    assert.deepEqual(neighborSelection(stacked, { kind: "unassigned" }, -1), { kind: "group", id: "ui" });
    assert.equal(neighborSelection(stacked, { kind: "unassigned" }, 1), undefined);
    assert.deepEqual(neighborSelection(stacked, { kind: "lockfiles" }, -1), { kind: "group", id: "ui" });
  });

  it("does nothing when there is no source", () => {
    assert.equal(neighborSelection(null, { kind: "overview" }, 1), undefined);
  });

  it("has no next group when the document has none", () => {
    const empty: SelectionStackSource = { groups: [], unassigned: { hunkCount: 1 } };
    assert.deepEqual(groupWalk(empty), [{ kind: "overview" }]);
    assert.equal(neighborSelection(empty, { kind: "overview" }, 1), undefined);
    assert.deepEqual(neighborSelection(empty, { kind: "unassigned" }, -1), { kind: "overview" });
  });

  it("shifts through the walk without wrapping", () => {
    const seen: Selection[] = [];
    const select = (selection: Selection) => {
      seen.push(selection);
    };
    shiftSelection(stacked, { kind: "overview" }, select, 1);
    shiftSelection(stacked, { kind: "group", id: "ui" }, select, 1);
    shiftSelection(stacked, { kind: "overview" }, select, -1);
    assert.deepEqual(seen, [{ kind: "group", id: "auth" }]);
  });
});

const story: SelectionStackSource = {
  groups: [
    {
      id: "login",
      part: "Session cookie",
      suggestedOrder: 1,
      dependsOn: ["cookie"],
    },
    {
      id: "cookie",
      part: "Session cookie",
      suggestedOrder: 0,
    },
    {
      id: "docs",
      part: "README",
      suggestedOrder: 2,
    },
  ],
  unassigned: { hunkCount: 0 },
};

function takePartShift(selection: Selection, delta: number): Selection | undefined {
  let next: Selection | undefined;
  shiftPartSelection(story, selection, (value) => {
    next = value;
  }, delta);
  return next;
}

describe("story and part selection", () => {
  it("orders the stack by dependsOn inside each part", () => {
    const ids = selectionStack(story)
      .filter((item): item is { kind: "group"; id: string } => item.kind === "group")
      .map((item) => item.id);
    assert.deepEqual(ids, ["cookie", "login", "docs"]);
  });

  it("walks every group across parts for [ and ]", () => {
    assert.deepEqual(neighborSelection(story, { kind: "overview" }, 1), { kind: "group", id: "cookie" });
    assert.deepEqual(neighborSelection(story, { kind: "group", id: "cookie" }, 1), { kind: "group", id: "login" });
    assert.deepEqual(neighborSelection(story, { kind: "group", id: "login" }, 1), { kind: "group", id: "docs" });
    assert.equal(neighborSelection(story, { kind: "group", id: "docs" }, 1), undefined);
    assert.deepEqual(neighborSelection(story, { kind: "group", id: "cookie" }, -1), { kind: "overview" });
  });

  it("moves between parts with { and }", () => {
    assert.deepEqual(takePartShift({ kind: "overview" }, 1), { kind: "group", id: "cookie" });
    assert.deepEqual(takePartShift({ kind: "group", id: "login" }, 1), { kind: "group", id: "docs" });
    assert.deepEqual(takePartShift({ kind: "group", id: "docs" }, 1), { kind: "group", id: "cookie" });
    assert.deepEqual(takePartShift({ kind: "group", id: "docs" }, -1), { kind: "group", id: "cookie" });
  });

  it("does nothing on unassigned", () => {
    assert.equal(neighborSelection(story, { kind: "unassigned" }, 1), undefined);
    assert.equal(takePartShift({ kind: "unassigned" }, 1), undefined);
  });
});
