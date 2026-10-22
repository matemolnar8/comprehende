import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, it } from "vite-plus/test";
import { cmdIndex, cmdRefresh, cmdValidate, sourceDrift } from "../cli/commands.ts";
import { apiFsRel } from "../api/paths.ts";
import { exportStaticSite } from "../api/snapshot.ts";
import type { ApiReview } from "../api/types.ts";
import { git } from "../git/exec.ts";
import { parseReviewJson } from "../schema/parse.ts";
import { shortSha, type DiffFile, type LiveHunk, type ReviewDocument } from "../schema/types.ts";
import {
  MIXED_GROUP_APP,
  MIXED_GROUP_DOCS,
  mixedCoveringDocument,
  reviewFileBody,
} from "../test/covering-document.ts";
import { createExampleRepo } from "../test/example-repo.ts";
import { formatRefresh, matchHunks, refreshDocument } from "./refresh.ts";

const roots: string[] = [];

afterAll(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

function hunk(path: string, oldStart: number, newStart: number, changed: string[]): LiveHunk {
  return {
    path,
    oldStart,
    oldLines: 1,
    newStart,
    newLines: 1,
    header: `@@ -${oldStart} +${newStart} @@`,
    lines: [
      { kind: "ctx", oldNumber: oldStart, newNumber: newStart, text: "context" },
      ...changed.map((text) => ({
        kind: "add" as const,
        oldNumber: null,
        newNumber: newStart,
        text,
      })),
    ],
    patch: "",
  };
}

function file(path: string, hunks: LiveHunk[], extra: Partial<DiffFile> = {}): DiffFile {
  return {
    path,
    status: "modified",
    binary: false,
    image: false,
    headerPatch: `diff --git a/${path} b/${path}\n`,
    patch: "",
    hunks,
    ...extra,
  };
}

function document(groups: ReviewDocument["groups"]): ReviewDocument {
  return {
    version: 1,
    source: { baseRef: "main", headRef: "feat", baseSha: "a".repeat(40), headSha: "b".repeat(40) },
    size: "small",
    title: "T",
    summary: "S",
    groups,
  };
}

describe("matchHunks", () => {
  it("keeps a hunk whose changed lines are the same even when its start moved", () => {
    const previous = [file("a.ts", [hunk("a.ts", 10, 10, ["x"]), hunk("a.ts", 40, 40, ["y"])])];
    const next = [file("a.ts", [hunk("a.ts", 10, 12, ["x"]), hunk("a.ts", 40, 42, ["z"])])];
    const delta = matchHunks(previous, next);
    assert.equal(delta.same.length, 1);
    assert.equal(delta.same[0]?.previous.newStart, 10);
    assert.equal(delta.same[0]?.next.newStart, 12);
    assert.equal(delta.changed.length, 1, "overlapping old lines with other content is an edit");
    assert.equal(delta.changed[0]?.previous.newStart, 40);
    assert.equal(delta.changed[0]?.next.newStart, 42);
    assert.deepEqual(delta.added, []);
    assert.deepEqual(delta.removed, []);
  });

  it("marks an edit that only moves whitespace as a reformat", () => {
    const previous = [file("a.ts", [hunk("a.ts", 10, 10, ["foo(a, b);"])])];
    const next = [file("a.ts", [hunk("a.ts", 10, 10, ["foo(", "  a,", "  b", ");"])])];
    const delta = matchHunks(previous, next);
    assert.equal(delta.reformat.length, 1);
    assert.equal(delta.changed.length, 0);
    const before = document([
      {
        id: "a",
        title: "A",
        why: "w",
        summary: "s",
        suggestedOrder: 0,
        hunkRefs: [{ path: "a.ts" }],
      },
    ]);
    const result = refreshDocument(before, previous, next, before.source);
    assert.deepEqual(
      result.groups.map((group) => [group.id, group.changed.length, group.reformatted.length]),
      [["a", 0, 1]],
    );
    const text = formatRefresh(result, next, { commits: [], stalePins: [] });
    assert.match(
      text,
      /^- a\.ts · modified \+4\/-0 · logic · hunks: a\.ts@10\+10 reformat · in a$/m,
    );
    assert.match(text, /^- a: 1 hunk reformatted$/m);
  });

  it("treats a hunk in another region of the file as new, and the old one as gone", () => {
    const previous = [file("a.ts", [hunk("a.ts", 10, 10, ["x"])])];
    const next = [file("a.ts", [hunk("a.ts", 80, 80, ["z"])])];
    const delta = matchHunks(previous, next);
    assert.equal(delta.changed.length, 0);
    assert.equal(delta.added.length, 1);
    assert.equal(delta.removed.length, 1);
  });

  it("tells image hunks apart by their header", () => {
    const image = (header: string): DiffFile =>
      file("shot.png", [hunk("shot.png", 0, 0, [])], { image: true, headerPatch: header });
    const changed = matchHunks([image("index 111..222")], [image("index 111..333")]);
    assert.equal(changed.same.length, 0);
    const same = matchHunks([image("index 111..222")], [image("index 111..222")]);
    assert.equal(same.same.length, 1);
  });
});

describe("refreshDocument", () => {
  it("re-points located refs, keeps path refs, drops gone refs, and drafts an update group", () => {
    const previous = [
      file("a.ts", [hunk("a.ts", 10, 10, ["x"]), hunk("a.ts", 40, 40, ["y"])]),
      file("b.ts", [hunk("b.ts", 1, 1, ["b"])]),
      file("gone.ts", [hunk("gone.ts", 1, 1, ["g"])]),
    ];
    const next = [
      file("a.ts", [hunk("a.ts", 10, 12, ["x"]), hunk("a.ts", 90, 92, ["z"])]),
      file("b.ts", [hunk("b.ts", 1, 1, ["b", "edited"]), hunk("b.ts", 30, 30, ["more"])]),
      file("fresh.ts", [hunk("fresh.ts", 1, 1, ["f"])], { status: "added" }),
    ];
    const before = document([
      {
        id: "update",
        title: "A",
        why: "w",
        summary: "s",
        suggestedOrder: 0,
        hunkRefs: [
          { path: "a.ts", oldStart: 10, newStart: 10 },
          { path: "a.ts", oldStart: 40, newStart: 40 },
        ],
      },
      {
        id: "b",
        title: "B",
        why: "w",
        summary: "s",
        suggestedOrder: 1,
        hunkRefs: [{ path: "b.ts" }],
      },
      {
        id: "g",
        title: "G",
        why: "w",
        summary: "s",
        suggestedOrder: 2,
        hunkRefs: [{ path: "gone.ts" }],
      },
    ]);
    const source = { ...before.source, headSha: "c".repeat(40) };
    const result = refreshDocument(before, previous, next, source);

    assert.deepEqual(result.document.source, source);
    assert.deepEqual(result.document.groups[0]?.hunkRefs, [
      { path: "a.ts", oldStart: 10, newStart: 12 },
    ]);
    assert.deepEqual(result.document.groups[1]?.hunkRefs, [{ path: "b.ts" }]);
    assert.deepEqual(result.document.groups[2]?.hunkRefs, []);
    assert.deepEqual(
      result.groups.map((group) => [
        group.id,
        group.dropped.length,
        group.moved,
        group.changed.length,
        group.reformatted.length,
        group.newHunks.length,
        group.empty,
      ]),
      [
        ["update", 1, 1, 0, 0, 0, false],
        ["b", 0, 0, 1, 0, 1, false],
        ["g", 1, 0, 0, 0, 0, true],
      ],
    );
    assert.deepEqual(result.unchanged, []);
    const update = result.document.groups[3];
    assert.equal(update?.id, "update-2");
    assert.equal(update?.suggestedOrder, 3);
    assert.match(update?.why ?? "", /new since bbbbbbb/);
    assert.deepEqual(update?.hunkRefs, [
      { path: "a.ts", oldStart: 90, newStart: 92 },
      { path: "fresh.ts" },
    ]);
    assert.equal(before.groups.length, 3, "input document is not mutated");

    const text = formatRefresh(result, next, { commits: ["Add fresh"], stalePins: ["s9"] });
    assert.match(text, /^# Refresh main\.\.\.feat — head bbbbbbb -> ccccccc · base unchanged$/m);
    assert.match(text, /^# 2 files changed · 1 new · 1 gone · 0 same$/m);
    assert.match(text, /^Commits since bbbbbbb:\n- Add fresh$/m);
    assert.match(
      text,
      /^- a\.ts · modified \+2\/-0 · logic · hunks: a\.ts@10\+12 same, a\.ts@90\+92 new · gone: a\.ts@40\+40 · in update, update-2$/m,
    );
    assert.match(
      text,
      /^- b\.ts · modified \+3\/-0 · logic · hunks: b\.ts@1\+1 changed, b\.ts@30\+30 new · in b$/m,
    );
    assert.match(text, /^- fresh\.ts · added \+1\/-0 · logic · new · in update-2$/m);
    assert.match(text, /^- gone\.ts · gone · was in g$/m);
    assert.match(text, /^- update: 1 ref gone · 1 ref re-pointed$/m);
    assert.match(text, /^- b: 1 hunk changed · 1 new hunk$/m);
    assert.match(text, /^- g: 1 ref gone · now empty$/m);
    assert.match(text, /^- update-2: draft · 2 uncovered hunks$/m);
    assert.match(text, /^Pins off a live line: s9$/m);
  });
});

describe("cmdRefresh", () => {
  it("carries a review over a new commit and validate accepts the result", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-refresh-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "repo"));
    const index = await cmdIndex(repo.root, repo.base, "main");
    const before = mixedCoveringDocument(index);
    const dataPath = join(root, "review.json");
    await writeFile(dataPath, reviewFileBody(before));

    const idle = await cmdRefresh(repo.root, dataPath, undefined, undefined);
    assert.equal(idle.changed, false);
    assert.match(idle.report, /^nothing to refresh/);

    const app = await readFile(join(repo.root, "src/app.ts"), "utf8");
    await writeFile(
      join(repo.root, "src/app.ts"),
      app.replace(
        'export const name = "beta";\n',
        'export const name = "beta";\nexport const version = 3;\n',
      ),
    );
    await writeFile(join(repo.root, "README.md"), "# Example\n\nBase readme.\n", "utf8");
    await writeFile(join(repo.root, "src/extra.ts"), "export const extra = true;\n", "utf8");
    await git(repo.root, ["add", "-A"]);
    await git(repo.root, ["commit", "-m", "Add version, extra, revert README"]);
    const head2 = (await git(repo.root, ["rev-parse", "HEAD"])).trim();

    const { document, report, changed } = await cmdRefresh(
      repo.root,
      dataPath,
      undefined,
      undefined,
    );
    assert.equal(changed, true);
    assert.equal(document.source.headSha, head2);
    assert.equal(document.source.baseSha, repo.base);

    const appGroup = document.groups.find((group) => group.id === MIXED_GROUP_APP);
    assert.deepEqual(appGroup?.hunkRefs, [
      { path: "src/app.ts", oldStart: 1, newStart: 1 },
      { path: "src/app.ts", oldStart: 97, newStart: 98 },
    ]);
    assert.deepEqual(document.groups.find((group) => group.id === MIXED_GROUP_DOCS)?.hunkRefs, []);
    const update = document.groups.at(-1);
    assert.equal(update?.id, "update");
    assert.deepEqual(update?.hunkRefs, [{ path: "src/extra.ts" }]);
    assert.equal(appGroup?.lookFor?.length, 1, "prose is untouched");

    assert.match(report, /^Commits since [0-9a-f]{7}:\n- Add version, extra, revert README$/m);
    assert.match(
      report,
      /^- src\/app\.ts · modified .* · hunks: src\/app\.ts@1\+1 changed, src\/app\.ts@97\+98 same · in app$/m,
    );
    assert.match(report, /^- src\/extra\.ts · added \+1\/-0 · logic · new · in update$/m);
    assert.match(report, /^- README\.md · gone · was in docs$/m);
    assert.match(report, /^- app: 1 hunk changed · 1 ref re-pointed$/m);
    assert.match(report, /^- docs: 1 ref gone · now empty$/m);
    assert.match(report, /^- update: draft · 1 uncovered hunk$/m);
    assert.match(report, /^- same: app-test, helpers, types, relocations, move-block$/m);

    const written = parseReviewJson(await readFile(dataPath, "utf8"));
    assert.equal(written.ok, true, written.ok ? "" : written.errors.join("\n"));
    const validated = await cmdValidate(repo.root, dataPath);
    assert.equal(validated.document.groups.length, document.groups.length);

    const kept = `review.${shortSha(before.source.headSha ?? "")}.json`;
    assert.equal(document.previous, kept);
    assert.equal(await readFile(join(root, kept), "utf8"), reviewFileBody(before));

    const uiRoot = join(root, "ui");
    await mkdir(uiRoot);
    await writeFile(join(uiRoot, "index.html"), "<!doctype html>\n");
    const site = join(root, "site");
    await exportStaticSite({ cwd: repo.root, dataPath, outDir: site, uiRoot });
    const hosted = JSON.parse(
      await readFile(join(site, ...apiFsRel({ kind: "review" }).split("/")), "utf8"),
    ) as ApiReview;

    // The skill's hosted Refresh path: `jq .document` saves the review.json back.
    const saved = `${JSON.stringify(hosted.document, null, 2)}\n`;
    assert.deepEqual(JSON.parse(saved), JSON.parse(await readFile(dataPath, "utf8")));
    const copied = join(root, "hosted", "review.json");
    await mkdir(dirname(copied));
    await writeFile(copied, saved);
    const again = await cmdRefresh(repo.root, copied, undefined, undefined);
    assert.equal(again.changed, false, "the kept review is not copied, and that is fine");

    const changes = hosted.changes;
    assert.deepEqual(changes?.since, { baseSha: repo.base, headSha: before.source.headSha });
    assert.deepEqual(changes?.hunks, { new: 1, changed: 1, reformat: 0, gone: 1 });
    const groups = new Map(changes?.groups.map((group) => [group.id, group]));
    assert.deepEqual(groups.get(MIXED_GROUP_APP)?.hunks, { new: 0, changed: 1, reformat: 0 });
    assert.deepEqual(groups.get(MIXED_GROUP_DOCS)?.files, { added: [], removed: ["README.md"] });
    assert.equal(groups.get("update")?.state, "added");
    assert.equal(groups.has("helpers"), false, "unchanged groups stay out");
  });

  it("refuses a document without pinned commits", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-refresh-old-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "repo"));
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const { baseSha: _b, headSha: _h, ...unpinned } = index.source;
    const dataPath = join(root, "review.json");
    await writeFile(
      dataPath,
      reviewFileBody({ ...mixedCoveringDocument(index), source: unpinned }),
    );
    await assert.rejects(
      () => cmdRefresh(repo.root, dataPath, undefined, undefined),
      /source\.baseSha and source\.headSha/,
    );
  });
});

describe("sourceDrift", () => {
  it("names the commit that moved", () => {
    const source = {
      baseRef: "main",
      headRef: "feat",
      baseSha: "a".repeat(40),
      headSha: "b".repeat(40),
    };
    assert.equal(
      sourceDrift(source, { baseSha: source.baseSha, headSha: source.headSha }, "r.json"),
      undefined,
    );
    assert.equal(
      sourceDrift(source, { baseSha: source.baseSha, headSha: "c".repeat(40) }, "r.json"),
      "head bbbbbbb -> ccccccc since this review was written. Run: comprehende refresh --data r.json",
    );
    assert.equal(
      sourceDrift({ baseRef: "main", headRef: "feat" }, { baseSha: "x", headSha: "y" }, "r.json"),
      undefined,
    );
  });
});
