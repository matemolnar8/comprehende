import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  groupWalk,
  hashWriteMode,
  neighborSelection,
  parseHash,
  restoreSelection,
  selectionCaption,
  selectionFromHash,
  selectionNavLabel,
  selectionStack,
  serializeHash,
  shiftPartSelection,
  shiftSelection,
  urlWithSelection,
  type Selection,
  type SelectionStackSource,
} from "./selection.ts";

const source: SelectionStackSource = {
  groups: [{ id: "auth" }, { id: "ui" }],
  unassigned: { hunkCount: 2 },
};

describe("selection hash", () => {
  it("round-trips overview, buckets, and a group", () => {
    const overview = { kind: "overview" } as const;
    const unassigned = { kind: "unassigned" } as const;
    const lockfiles = { kind: "lockfiles" } as const;
    const group = { kind: "group", id: "auth" } as const;
    assert.equal(serializeHash(overview), "#overview");
    assert.equal(serializeHash(unassigned), "#unassigned");
    assert.equal(serializeHash(lockfiles), "#lockfiles");
    assert.equal(serializeHash(group), "#group/auth");
    assert.deepEqual(parseHash(serializeHash(overview)), overview);
    assert.deepEqual(parseHash(serializeHash(unassigned)), unassigned);
    assert.deepEqual(parseHash(serializeHash(lockfiles)), lockfiles);
    assert.deepEqual(parseHash(serializeHash(group)), group);
  });

  it("reads hashes with or without a leading slash", () => {
    assert.deepEqual(parseHash("overview"), { kind: "overview" });
    assert.deepEqual(parseHash("#/overview"), { kind: "overview" });
    assert.deepEqual(parseHash("#group/auth"), { kind: "group", id: "auth" });
  });

  it("encodes group ids so a slash in the id stays in the id", () => {
    const group = { kind: "group", id: "auth/login" } as const;
    assert.equal(serializeHash(group), "#group/auth%2Flogin");
    assert.deepEqual(parseHash("#group/auth%2Flogin"), group);
    assert.deepEqual(parseHash("#group/auth/login"), group);
  });

  it("treats missing or invalid hashes as empty", () => {
    assert.equal(parseHash(""), null);
    assert.equal(parseHash("#"), null);
    assert.equal(parseHash("#group/"), null);
    assert.equal(parseHash("#group/%"), null);
    assert.equal(parseHash("#other"), null);
    assert.equal(parseHash("#Group/auth"), null);
  });

  it("restores a live group and falls back when the hash is gone", () => {
    assert.deepEqual(selectionFromHash(source, "#group/ui"), { kind: "group", id: "ui" });
    assert.deepEqual(selectionFromHash(source, "#group/gone"), { kind: "overview" });
    assert.deepEqual(selectionFromHash(source, ""), { kind: "overview" });
    assert.deepEqual(selectionFromHash(source, "#bogus"), { kind: "overview" });
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

  it("writes the same hash on a serve URL and a GitHub Pages export URL", () => {
    const serve = "http://127.0.0.1:4310/";
    const pages = "https://matemolnar8.github.io/comprehende/pr/78/";
    const group = { kind: "group", id: "auth" } as const;
    assert.equal(urlWithSelection(serve, { kind: "overview" }), "http://127.0.0.1:4310/#overview");
    assert.equal(urlWithSelection(pages, group), "https://matemolnar8.github.io/comprehende/pr/78/#group/auth");
    assert.equal(
      urlWithSelection(`${pages}#overview`, group),
      "https://matemolnar8.github.io/comprehende/pr/78/#group/auth",
    );
  });

  it("replaces an empty or dead hash, then pushes live hops", () => {
    const overview = { kind: "overview" } as const;
    const auth = { kind: "group", id: "auth" } as const;
    assert.equal(hashWriteMode(source, "", overview, false), "replace");
    assert.equal(hashWriteMode(source, "#overview", overview, false), "skip");
    assert.equal(hashWriteMode(source, "#overview", auth, true), "push");
    assert.equal(hashWriteMode(source, "#group/gone", overview, true), "replace");
    assert.equal(hashWriteMode(source, "#bogus", overview, true), "replace");
    assert.equal(hashWriteMode(source, "#group/auth", auth, true), "skip");
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

  it("pushes a live hash for [ ] and { } hops", () => {
    const nextGroup = neighborSelection(story, { kind: "overview" }, 1);
    assert.deepEqual(nextGroup, { kind: "group", id: "cookie" });
    assert.equal(serializeHash(nextGroup!), "#group/cookie");
    assert.equal(hashWriteMode(story, "#overview", nextGroup!, true), "push");
    const nextPart = takePartShift({ kind: "group", id: "login" }, 1);
    assert.deepEqual(nextPart, { kind: "group", id: "docs" });
    assert.equal(serializeHash(nextPart!), "#group/docs");
    assert.equal(hashWriteMode(story, "#group/login", nextPart!, true), "push");
  });
});
