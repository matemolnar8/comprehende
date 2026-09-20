import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { listEvalCases, parseEvalCaseJson, selectEvalCases } from "./case.ts";
import { findPackageRoot } from "../../src/package-root.ts";

const roots: string[] = [];
after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("eval case schema", () => {
  it("parses a full case and rejects extra keys", () => {
    const spec = parseEvalCaseJson(`{
      "id": "comprehende-47",
      "repo": "https://github.com/matemolnar8/comprehende.git",
      "pr": 47,
      "base": "abc",
      "head": "def",
      "tags": ["schema"],
      "expect": {
        "why": "present",
        "parts": { "min": 1, "max": 2 },
        "size": ["large"],
        "together": [["src/a.ts", "src/b.ts"]]
      }
    }`);
    assert.equal(spec.id, "comprehende-47");
    assert.equal(spec.expect?.why, "present");
    assert.throws(() => parseEvalCaseJson(`{"id":"x","repo":"r","pr":1,"base":"a","head":"b","extra":true}`));
  });

  it("defaults tags and lists folders that match --case and --tag", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-cases-"));
    roots.push(root);
    await mkdir(join(root, "comprehende-50"));
    await writeFile(
      join(root, "comprehende-50/case.json"),
      `${JSON.stringify({ id: "comprehende-50", repo: "https://github.com/matemolnar8/comprehende.git", pr: 50, base: "a", head: "b", tags: ["smoke"] })}\n`,
    );
    await mkdir(join(root, "comprehende-47"));
    await writeFile(
      join(root, "comprehende-47/case.json"),
      `${JSON.stringify({ id: "comprehende-47", repo: "https://github.com/matemolnar8/comprehende.git", pr: 47, base: "a", head: "b" })}\n`,
    );
    const listed = await listEvalCases(root);
    assert.deepEqual(
      listed.map((item) => item.spec.id),
      ["comprehende-47", "comprehende-50"],
    );
    assert.deepEqual(listed[0]?.spec.tags, []);
    assert.equal(selectEvalCases(listed, { tag: "smoke" }).length, 1);
    assert.equal(selectEvalCases(listed, { ids: ["comprehende-47"] }).length, 1);
    await mkdir(join(root, "mismatch"));
    await writeFile(
      join(root, "mismatch/case.json"),
      `${JSON.stringify({ id: "other", repo: "https://github.com/matemolnar8/comprehende.git", pr: 1, base: "a", head: "b" })}\n`,
    );
    await assert.rejects(() => listEvalCases(root), /does not match folder/);
  });

  it("loads the checked-in eval cases", async () => {
    const root = findPackageRoot();
    const listed = await listEvalCases(join(root, "eval/cases"));
    const ids = listed.map((item) => item.spec.id);
    assert.ok(ids.includes("comprehende-50"));
    assert.ok(ids.includes("vitadeck-24"));
    const smoke = selectEvalCases(listed, { tag: "smoke" }).map((item) => item.spec.id);
    assert.deepEqual(smoke, ["comprehende-50", "comprehende-57"]);
    const full = selectEvalCases(listed, {}).map((item) => item.spec.id);
    assert.deepEqual(full, ids);
    assert.equal(full.includes("vitadeck-24"), true);
    const fifty = listed.find((item) => item.spec.id === "comprehende-50")?.spec.expect;
    const fiftySeven = listed.find((item) => item.spec.id === "comprehende-57")?.spec.expect;
    assert.equal(fifty?.why, "present");
    assert.equal(fiftySeven?.why, "present");
    assert.equal(fiftySeven?.parts?.min, 0);
    assert.equal(fiftySeven?.together, undefined);
  });
});
