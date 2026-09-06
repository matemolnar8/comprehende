import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseSelection,
  restoreSelection,
  selectionCaption,
  selectionStorageKey,
  serializeSelection,
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
});
