import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyCliPin, cliPinErrors } from "./cli-pin.ts";
import { loadWorkingTreeSkillSync, skillSyncErrors } from "./skill-sync.ts";

describe("skill schema sync", () => {
  it("keeps package version, schema, and skill copies in sync", async () => {
    assert.deepEqual(skillSyncErrors(await loadWorkingTreeSkillSync()), []);
  });
});

describe("cli pin rewrite", () => {
  it("rewrites every npx comprehende@ pin to the given version", () => {
    const markdown = ["npx comprehende@0.0.1 index", "`npx comprehende@9.9.9`", "npx comprehende@0.1.0 serve"].join(
      "\n",
    );
    const updated = applyCliPin(markdown, "1.2.3");
    assert.equal(updated.includes("npx comprehende@1.2.3"), true);
    assert.equal(updated.includes("npx comprehende@0.0.1"), false);
    assert.equal(updated.includes("npx comprehende@9.9.9"), false);
    assert.deepEqual(cliPinErrors(updated, "1.2.3"), []);
  });

  it("fails when the skill has no pin", () => {
    assert.deepEqual(cliPinErrors("run comprehende index", "0.1.0"), ["SKILL.md must pin npx comprehende@0.1.0"]);
  });

  it("fails when a pin does not match package.json", () => {
    assert.deepEqual(cliPinErrors("npx comprehende@0.2.0 index", "0.1.0"), [
      "SKILL.md pins npx comprehende@0.2.0, package.json version is 0.1.0",
    ]);
  });
});
