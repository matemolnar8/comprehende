import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "vite-plus/test";
import { cmdIndex, cmdValidate } from "../cli/commands.ts";
import { mixedCoveringDocument, reviewFileBody } from "../test/covering-document.ts";
import { createExampleRepo } from "../test/example-repo.ts";
import type { DiffFile, LiveHunk, ReviewDocument, ReviewGroup } from "../schema/types.ts";
import { anchorErrors, fileNoteErrors } from "./anchors.ts";
import { joinCoverage } from "./coverage.ts";
import { formatRefresh, refreshDocument } from "./refresh.ts";

/** A hunk from diff body lines: " ctx", "+add", "-del". */
function liveHunk(path: string, oldStart: number, newStart: number, body: string[]): LiveHunk {
  let oldNumber = oldStart;
  let newNumber = newStart;
  const lines = body.map((raw) => {
    const text = raw.slice(1);
    if (raw.startsWith("+")) {
      return { kind: "add" as const, oldNumber: null, newNumber: newNumber++, text };
    }
    if (raw.startsWith("-")) {
      return { kind: "del" as const, oldNumber: oldNumber++, newNumber: null, text };
    }
    return { kind: "ctx" as const, oldNumber: oldNumber++, newNumber: newNumber++, text };
  });
  return {
    path,
    oldStart,
    oldLines: oldNumber - oldStart,
    newStart,
    newLines: newNumber - newStart,
    header: `@@ -${oldStart},${oldNumber - oldStart} +${newStart},${newNumber - newStart} @@`,
    lines,
    patch: "",
  };
}

function diffFile(path: string, hunks: LiveHunk[]): DiffFile {
  return {
    path,
    status: "modified",
    binary: false,
    image: false,
    headerPatch: `diff --git a/${path} b/${path}\n`,
    patch: "",
    hunks,
  };
}

function document(groups: ReviewGroup[]): ReviewDocument {
  return {
    version: 1,
    source: { baseRef: "main", headRef: "feat", baseSha: "a".repeat(40), headSha: "b".repeat(40) },
    size: "small",
    title: "T",
    summary: "S",
    groups,
  };
}

function group(id: string, path: string, extra: Partial<ReviewGroup> = {}): ReviewGroup {
  return {
    id,
    title: id,
    why: "w",
    summary: "s",
    suggestedOrder: 0,
    hunkRefs: [{ path }],
    ...extra,
  };
}

// new lines 10-15, old lines 10-13
const login = liveHunk("login.ts", 10, 10, [" a", "-b", "+B", "+C", "+D", " e", " f"]);
const api = liveHunk("api.ts", 1, 1, [" x", "+y", " z"]);

describe("anchorErrors", () => {
  it("accepts ranges and notes inside a hunk of their group, on either side", () => {
    const doc = document([
      group("login", "login.ts", {
        focus: [{ path: "login.ts", side: "new", start: 10, end: 15, caption: "c" }],
        notes: [
          { path: "login.ts", side: "new", line: 12, body: "n" },
          { path: "login.ts", side: "old", line: 11, body: "n" },
        ],
      }),
      group("api", "api.ts"),
    ]);
    assert.deepEqual(anchorErrors(joinCoverage(doc, [login, api])), []);
  });

  it("names each range or note that leaves its hunk, sits on another group's hunk, or misses the side", () => {
    const doc = document([
      group("login", "login.ts", {
        focus: [{ path: "login.ts", side: "new", start: 12, end: 16, caption: "c" }],
        notes: [
          { path: "api.ts", side: "new", line: 2, body: "other group" },
          { path: "login.ts", side: "old", line: 14, body: "past the old side" },
        ],
      }),
      group("api", "api.ts"),
    ]);
    const [error, ...rest] = anchorErrors(joinCoverage(doc, [login, api]));
    assert.deepEqual(rest, []);
    assert.match(error ?? "", /^anchor: 3 focus range\(s\) or note\(s\)/);
    assert.match(
      error ?? "",
      /^ {2}login focus\[0\] login\.ts new:12-16 · group hunks on new: 10-15$/m,
    );
    assert.match(error ?? "", /^ {2}login notes\[0\] api\.ts new:2 · this group has no hunk/m);
    assert.match(
      error ?? "",
      /^ {2}login notes\[1\] login\.ts old:14 · group hunks on old: 10-13$/m,
    );
  });
});

describe("fileNoteErrors", () => {
  it("accepts a note on a file or a lockfile the group covers, and names one on another file", () => {
    const doc = document([
      group("login", "login.ts", {
        hunkRefs: [{ path: "login.ts" }, { path: "pnpm-lock.yaml" }],
        fileNotes: { "login.ts": "f", "pnpm-lock.yaml": "Lockfile for the new dependency." },
      }),
      group("api", "api.ts", { fileNotes: { "login.ts": "other group", "gone.ts": "no file" } }),
    ]);
    const [error, ...rest] = fileNoteErrors(joinCoverage(doc, [login, api]));
    assert.deepEqual(rest, []);
    assert.match(error ?? "", /^fileNotes: 2 note\(s\)/);
    assert.match(error ?? "", /^ {2}api fileNotes "login\.ts"$/m);
    assert.match(error ?? "", /^ {2}api fileNotes "gone\.ts"$/m);
  });
});

describe("validate", () => {
  it("accepts the fixture's focus and notes, and fails loudly on a range past its hunk", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-anchors-"));
    try {
      const repo = await createExampleRepo(join(root, "repo"));
      const dataPath = join(root, "review.json");
      const valid = mixedCoveringDocument(await cmdIndex(repo.root, repo.base, repo.head));
      await writeFile(dataPath, reviewFileBody(valid));
      await cmdValidate(repo.root, dataPath);

      const app = valid.groups[0];
      assert.ok(app?.focus?.[0]);
      const broken = {
        ...valid,
        groups: [{ ...app, focus: [{ ...app.focus[0], end: 12 }] }, ...valid.groups.slice(1)],
      };
      await writeFile(dataPath, reviewFileBody(broken));
      await assert.rejects(
        () => cmdValidate(repo.root, dataPath),
        /anchor: 1 focus range\(s\) or note\(s\)[^]*app focus\[0\] src\/app\.ts new:1-12/,
      );

      const stray = {
        ...valid,
        groups: [
          { ...app, fileNotes: { "README.md": "Not this group's file." } },
          ...valid.groups.slice(1),
        ],
      };
      await writeFile(dataPath, reviewFileBody(stray));
      await assert.rejects(
        () => cmdValidate(repo.root, dataPath),
        /fileNotes: 1 note\(s\)[^]*app fileNotes "README\.md"/,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("refresh carries focus ranges, notes, and file notes", () => {
  const before = document([
    group("login", "login.ts", {
      focus: [{ path: "login.ts", side: "new", start: 11, end: 13, caption: "c" }],
      notes: [{ path: "login.ts", side: "new", line: 12, body: "n" }],
      fileNotes: { "login.ts": "f" },
    }),
    group("api", "api.ts", {
      focus: [{ path: "api.ts", side: "new", start: 1, end: 3, caption: "c" }],
      notes: [{ path: "api.ts", side: "old", line: 2, body: "n" }],
      fileNotes: { "api.ts": "f" },
    }),
  ]);
  const previous = [diffFile("api.ts", [api]), diffFile("login.ts", [login])];

  it("shifts them with a same hunk, even when its leading context changed", () => {
    // Five lines land above the hunk, and git now shows one context line fewer before it.
    const moved = liveHunk("login.ts", 11, 16, ["-b", "+B", "+C", "+D", " e", " f"]);
    const next = [diffFile("api.ts", [api]), diffFile("login.ts", [moved])];
    const result = refreshDocument(before, previous, next, before.source);
    const login = result.document.groups.find((item) => item.id === "login");
    assert.deepEqual(login?.focus?.[0], {
      path: "login.ts",
      side: "new",
      start: 16,
      end: 18,
      caption: "c",
    });
    assert.equal(login?.notes?.[0]?.line, 17);
    assert.deepEqual(login?.fileNotes, { "login.ts": "f" });
    assert.deepEqual(result.unchanged, ["login", "api"], "a shift alone is not news");
  });

  it("drops and counts one that sat on context the same hunk no longer shows", () => {
    const doc = document([
      group("login", "login.ts", {
        notes: [
          { path: "login.ts", side: "new", line: 10, body: "on leading context" },
          { path: "login.ts", side: "new", line: 12, body: "on a changed line" },
        ],
      }),
    ]);
    const trimmed = liveHunk("login.ts", 11, 16, ["-b", "+B", "+C", "+D", " e", " f"]);
    const result = refreshDocument(
      doc,
      [diffFile("login.ts", [login])],
      [diffFile("login.ts", [trimmed])],
      doc.source,
    );
    assert.deepEqual(
      result.document.groups[0]?.notes?.map((note) => note.line),
      [17],
    );
    assert.deepEqual(result.groups[0]?.droppedAnchors, { focus: 0, notes: 1, fileNotes: 0 });
  });

  it("drops them with a changed hunk and names the group; drops them silently with a gone hunk", () => {
    const edited = liveHunk("login.ts", 10, 10, [" a", "-b", "+Q", " e", " f"]);
    const next = [diffFile("login.ts", [edited])];
    const result = refreshDocument(before, previous, next, before.source);
    const [login, api] = result.document.groups;
    assert.equal(login?.focus, undefined);
    assert.equal(login?.notes, undefined);
    assert.equal(login?.fileNotes, undefined);
    assert.equal(api?.focus, undefined);
    assert.equal(api?.notes, undefined);
    assert.equal(api?.fileNotes, undefined);
    const text = formatRefresh(result, next, { commits: [], stalePins: [] });
    assert.match(
      text,
      /^- login: 1 hunk changed · 1 focus range dropped · 1 note dropped · 1 file note dropped$/m,
    );
    assert.match(text, /^- api: 1 ref gone · now empty$/m);
  });
});
