import { writeFile } from "node:fs/promises";
import { toHunkRef } from "../git/diff.ts";
import { hunkKey } from "../schema/identity.ts";
import type { HunkIndex, HunkRef, ReviewDocument, ReviewGroup } from "../schema/types.ts";

export const MIXED_PART_APP = "App name";
export const MIXED_PART_LIB = "Helpers and Id";
export const MIXED_PART_DOCS = "README";
export const MIXED_GROUP_APP = "app";
export const MIXED_GROUP_APP_TEST = "app-test";
export const MIXED_GROUP_HELPERS = "helpers";
export const MIXED_GROUP_TYPES = "types";
export const MIXED_GROUP_DOCS = "docs";

export function coveringDocument(index: HunkIndex): ReviewDocument {
  return {
    version: 1,
    source: index.source,
    size: "small",
    title: "All changes",
    summary: "Every hunk in the range.",
    groups: [
      {
        id: "all",
        title: "All changes",
        why: "Covers every hunk in the range.",
        summary: "Every hunk in the range.",
        suggestedOrder: 0,
        hunkRefs: index.hunks.map(toHunkRef),
      },
    ],
  };
}

export function mixedCoveringDocument(index: HunkIndex): ReviewDocument {
  const app = hunksAt(index, "src/app.ts");
  const appTest = hunksAt(index, "src/app.test.ts");
  const helpers = hunksAt(index, "src/helpers.ts");
  const types = hunksAt(index, "src/types.ts");
  const docs = hunksAt(index, "README.md");
  const groups: ReviewGroup[] = [
    {
      id: MIXED_GROUP_APP,
      title: "App export",
      why: "[#1](source:s1) asks for the app export to be beta.",
      summary: "`src/app.ts` changes `name` from alpha to beta and updates the end marker.",
      part: MIXED_PART_APP,
      sources: ["s1"],
      lookFor: [
        "For the `name` export in `src/app.ts`, old is `alpha`; new is `beta`. `start()` returns the new name.",
      ],
      suggestedOrder: 0,
      hunkRefs: app,
    },
    {
      id: MIXED_GROUP_APP_TEST,
      title: "App name test",
      why: "The new name needs a test that fails on the old export.",
      summary: "`src/app.test.ts` asserts that `name` is `beta`.",
      part: MIXED_PART_APP,
      dependsOn: [MIXED_GROUP_APP],
      suggestedOrder: 1,
      hunkRefs: appTest,
    },
    {
      id: MIXED_GROUP_HELPERS,
      title: "Helpers rename",
      why: "The util module is renamed. That is its own concern in this story.",
      summary: "`src/util.ts` becomes `src/helpers.ts` and the label string matches.",
      part: MIXED_PART_LIB,
      sources: ["s2"],
      suggestedOrder: 2,
      hunkRefs: helpers,
    },
    {
      id: MIXED_GROUP_TYPES,
      title: "Widen Id",
      why: "The same commit widens `Id`. That change is read with the helpers rename.",
      summary: "`src/types.ts` changes `Id` from `string` to `string | number`.",
      part: MIXED_PART_LIB,
      sources: ["s2"],
      lookFor: ["Breaking. `Id` is now `string | number`. A caller that stored only strings still type-checks."],
      suggestedOrder: 3,
      hunkRefs: types,
    },
    {
      id: MIXED_GROUP_DOCS,
      title: "README wording",
      why: "The README is independent documentation and could have been its own pull request.",
      summary: "The README describes the head tree.",
      part: MIXED_PART_DOCS,
      sources: ["s3"],
      suggestedOrder: 4,
      hunkRefs: docs,
    },
  ];
  const document: ReviewDocument = {
    version: 1,
    source: index.source,
    size: "small",
    title: "Rename the app, move helpers, and update the README",
    summary:
      "The app export changes from alpha to beta with a matching test. The util module becomes helpers and Id widens. The README text is updated.",
    parts: [
      {
        name: MIXED_PART_APP,
        summary: "The app export changes from alpha to beta, and a test checks the new name.",
      },
      {
        name: MIXED_PART_LIB,
        summary: "`util.ts` becomes `helpers.ts`, and `Id` accepts number.",
      },
      {
        name: MIXED_PART_DOCS,
        summary: "The README describes the head tree.",
      },
    ],
    sources: [
      {
        id: "s1",
        kind: "ticket",
        label: "#1",
        title: "Rename the example app",
        gist: "The app export should be beta, and a CHANGELOG should record it.",
        part: MIXED_PART_APP,
      },
      {
        id: "s2",
        kind: "commit",
        label: "Split app hunks, rename util, widen Id",
        gist: "Head commit also renames util and widens Id.",
        part: MIXED_PART_LIB,
      },
      {
        id: "s3",
        kind: "pr-comment",
        label: "reviewer on README",
        author: "reviewer",
        body: "Does the README mention the helpers rename?",
        part: MIXED_PART_DOCS,
      },
    ],
    lookFor: [
      "[#1](source:s1) also asks for a CHANGELOG entry. No hunk touches CHANGELOG.",
      "Subtle. [#1](source:s1) wants the new name visible to callers. The pad constants in `src/app.ts` keep their old numbers.",
    ],
    groups,
  };
  assertFullCoverage(index, document);
  return document;
}

export async function writeCoveringDocument(dataPath: string, index: HunkIndex): Promise<ReviewDocument> {
  return writeReview(dataPath, coveringDocument(index));
}

export async function writeMixedCoveringDocument(dataPath: string, index: HunkIndex): Promise<ReviewDocument> {
  return writeReview(dataPath, mixedCoveringDocument(index));
}

async function writeReview(dataPath: string, document: ReviewDocument): Promise<ReviewDocument> {
  await writeFile(dataPath, `${JSON.stringify(document, null, 2)}\n`);
  return document;
}

function hunksAt(index: HunkIndex, path: string): HunkRef[] {
  const hunks = index.hunks.filter((hunk) => hunk.path === path).map(toHunkRef);
  if (hunks.length === 0) {
    throw new Error(`example fixture has no hunks at ${path}`);
  }
  return hunks;
}

function assertFullCoverage(index: HunkIndex, document: ReviewDocument): void {
  const assigned = new Set(document.groups.flatMap((group) => group.hunkRefs).map(hunkKey));
  const missed = index.hunks.filter((hunk) => !assigned.has(hunkKey(hunk)));
  if (missed.length > 0) {
    throw new Error(`mixed covering document missed ${missed.map((hunk) => hunk.path).join(", ")}`);
  }
}
