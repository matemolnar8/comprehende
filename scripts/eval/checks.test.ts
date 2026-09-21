import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import type { ReviewDocument } from "../../src/schema/types.ts";
import { git } from "../../src/git/exec.ts";
import { initEmptyRepo } from "../../src/test/init-repo.ts";
import { proseLints, runDeterministicChecks } from "./checks.ts";

const roots: string[] = [];
after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

function doc(over: Partial<ReviewDocument> & Pick<ReviewDocument, "groups">): ReviewDocument {
  return {
    version: 1,
    source: { baseRef: "base", headRef: "HEAD" },
    size: "small",
    title: "A change",
    summary: "The code does a thing.",
    ...over,
  };
}

const hunk = (path: string) => ({ path, oldStart: 1, oldLines: 1, newStart: 1, newLines: 2 });

describe("eval deterministic checks", () => {
  it("flags invented why, mixed groups, long sentences, and dashes", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-checks-"));
    roots.push(root);
    await initEmptyRepo(root);
    await writeFile(join(root, "README.md"), "x\n");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "init"]);
    const long =
      "This sentence has way more than twenty five words in it and that is enough to trip the lint because the skill asked for a split.";
    const document = doc({
      why: "We invented a motive.",
      size: "large",
      sources: [
        {
          id: "s1",
          kind: "ticket",
          label: "#99",
          url: "https://github.com/matemolnar8/comprehende/issues/99",
        },
        { id: "s2", kind: "transcript", label: "session" },
      ],
      groups: [
        {
          id: "ui",
          title: "UI",
          why: "Directory grouping.",
          summary: long,
          part: "ui",
          suggestedOrder: 0,
          hunkRefs: [hunk("src/ui/a.ts"), hunk("src/cli/b.ts")],
        },
      ],
    });
    const report = await runDeterministicChecks({
      cwd: root,
      document: {
        ...document,
        title: "Title with an em dash \u2014 here",
      },
      expect: {
        why: "absent",
        parts: { min: 2, max: 2 },
        size: ["small"],
        together: [["src/schema/a.ts", "src/schema/b.ts"]],
        apart: [["src/ui/a.ts", "src/cli/b.ts"]],
        sourceKinds: ["pr-comment"],
        mechanicalPaths: ["skills-next/comprehende/references/review.schema.json"],
      },
      frozen: [{ html_url: "https://github.com/matemolnar8/comprehende/pull/1" }],
    });
    const checks = new Set(report.failures.map((item) => item.check));
    assert.ok(checks.has("why"));
    assert.ok(checks.has("parts"));
    assert.ok(checks.has("size"));
    assert.ok(checks.has("together"));
    assert.ok(checks.has("apart"));
    assert.ok(checks.has("sources"));
    assert.ok(checks.has("sourceKinds"));
    assert.ok(checks.has("mechanical"));
    assert.equal(checks.has("proseLint"), false);
    assert.ok(report.lints.some((item) => item.includes("em dash") || item.includes("en dash")));
    assert.ok(report.lints.some((item) => item.includes("word sentence")));
    assert.equal(report.apartOk, 0);
    assert.equal(report.togetherOk, 0);
  });

  it("accepts a matching review", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-checks-ok-"));
    roots.push(root);
    await initEmptyRepo(root);
    await writeFile(join(root, "README.md"), "x\n");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "init"]);
    const document = doc({
      groups: [
        {
          id: "core",
          title: "Parser",
          why: "The schema is the boundary.",
          summary: "review.ts and parse.ts share one Zod schema.",
          part: "schema",
          suggestedOrder: 0,
          hunkRefs: [hunk("src/schema/review.ts"), hunk("src/schema/parse.ts")],
        },
        {
          id: "copies",
          title: "Generated copies",
          why: "Mechanical schema copies.",
          summary: "Skill trees get the generated JSON Schema.",
          part: "schema",
          suggestedOrder: 1,
          hunkRefs: [hunk("skills-next/comprehende/references/review.schema.json")],
        },
      ],
    });
    const report = await runDeterministicChecks({
      cwd: root,
      document,
      expect: {
        why: "absent",
        parts: { min: 1, max: 1 },
        size: ["small"],
        together: [["src/schema/review.ts", "src/schema/parse.ts"]],
        apart: [["src/schema/review.ts", "README.md"]],
        mechanicalPaths: ["skills-next/comprehende/references/review.schema.json"],
      },
      frozen: [],
    });
    assert.deepEqual(report.failures, []);
    assert.deepEqual(report.lints, []);
    assert.equal(report.togetherOk, 1);
    assert.equal(report.apartOk, 1);
    assert.equal(proseLints(document).length, 0);
  });

  it("keeps long-sentence prose lint off the fatal failures list", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-checks-lint-"));
    roots.push(root);
    await initEmptyRepo(root);
    await writeFile(join(root, "README.md"), "x\n");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "init"]);
    const long =
      "This sentence has way more than twenty five words in it and that is enough to trip the lint because the skill asked for a split.";
    const document = doc({
      lookFor: [long],
      groups: [
        {
          id: "core",
          title: "Parser",
          why: "The schema is the boundary.",
          summary: "review.ts and parse.ts share one Zod schema.",
          part: "schema",
          suggestedOrder: 0,
          hunkRefs: [hunk("src/schema/review.ts")],
        },
      ],
    });
    const report = await runDeterministicChecks({ cwd: root, document, frozen: [] });
    assert.deepEqual(report.failures, []);
    assert.equal(report.lints.length, 1);
    assert.match(report.lints[0] ?? "", /document lookFor has a \d+-word sentence/);
  });

  it("allows a GitHub commit URL when the SHA is in the reviewed range", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-checks-commit-url-"));
    roots.push(root);
    await initEmptyRepo(root);
    await writeFile(join(root, "README.md"), "x\n");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "init"]);
    const base = (await git(root, ["rev-parse", "HEAD"])).trim();
    await writeFile(join(root, "README.md"), "y\n");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "change readme"]);
    const head = (await git(root, ["rev-parse", "HEAD"])).trim();
    const document = doc({
      source: { baseRef: base, headRef: head, range: `${base}...${head}` },
      sources: [
        {
          id: "s1",
          kind: "commit",
          label: head.slice(0, 8),
          url: `https://github.com/matemolnar8/comprehende/commit/${head}`,
          title: "change readme",
          gist: "Edits the readme.",
        },
      ],
      groups: [
        {
          id: "core",
          title: "Parser",
          why: "The schema is the boundary.",
          summary: "review.ts and parse.ts share one Zod schema.",
          part: "schema",
          suggestedOrder: 0,
          hunkRefs: [hunk("src/schema/review.ts")],
        },
      ],
    });
    const ok = await runDeterministicChecks({
      cwd: root,
      document,
      frozen: [],
      repo: { owner: "matemolnar8", repo: "comprehende" },
    });
    assert.deepEqual(ok.failures, []);

    const otherRepo = await runDeterministicChecks({
      cwd: root,
      document,
      frozen: [],
      repo: { owner: "other", repo: "place" },
    });
    assert.ok(otherRepo.failures.some((item) => item.check === "sources" && item.message.includes("not this repo")));

    const invented = await runDeterministicChecks({
      cwd: root,
      document: {
        ...document,
        sources: [
          {
            id: "s1",
            kind: "commit",
            label: "deadbeef",
            url: "https://github.com/matemolnar8/comprehende/commit/deadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
          },
        ],
      },
      frozen: [],
      repo: { owner: "matemolnar8", repo: "comprehende" },
    });
    assert.ok(invented.failures.some((item) => item.check === "sources" && item.message.includes("url sha is not in")));
  });

  it("rejects a commit that only sits on the base side of the fork", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-checks-commit-base-"));
    roots.push(root);
    await initEmptyRepo(root);
    await writeFile(join(root, "README.md"), "x\n");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "init"]);
    await git(root, ["checkout", "-b", "feature"]);
    await writeFile(join(root, "README.md"), "y\n");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "feature change"]);
    const head = (await git(root, ["rev-parse", "HEAD"])).trim();
    await git(root, ["checkout", "main"]);
    await writeFile(join(root, "other.md"), "main only\n");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "main only"]);
    const base = (await git(root, ["rev-parse", "HEAD"])).trim();
    const document = doc({
      source: { baseRef: base, headRef: head, range: `${base}...${head}` },
      sources: [
        {
          id: "s1",
          kind: "commit",
          label: base.slice(0, 8),
          url: `https://github.com/matemolnar8/comprehende/commit/${base}`,
        },
      ],
      groups: [
        {
          id: "core",
          title: "Parser",
          why: "The schema is the boundary.",
          summary: "review.ts and parse.ts share one Zod schema.",
          part: "schema",
          suggestedOrder: 0,
          hunkRefs: [hunk("src/schema/review.ts")],
        },
      ],
    });
    const report = await runDeterministicChecks({
      cwd: root,
      document,
      frozen: [],
      repo: { owner: "matemolnar8", repo: "comprehende" },
    });
    assert.ok(report.failures.some((item) => item.check === "sources" && item.message.includes("url sha is not in")));

    const onHead = await runDeterministicChecks({
      cwd: root,
      document: {
        ...document,
        sources: [
          {
            id: "s1",
            kind: "commit",
            label: head.slice(0, 8),
            url: `https://github.com/matemolnar8/comprehende/commit/${head}`,
          },
        ],
      },
      frozen: [],
      repo: { owner: "matemolnar8", repo: "comprehende" },
    });
    assert.deepEqual(onHead.failures, []);
  });
});
