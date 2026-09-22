import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { producerPrompt } from "./producer.ts";

describe("producer prompt", () => {
  it("skips the npm version check without pinning it to step 1", () => {
    const prompt = producerPrompt({
      skillMd: "/tmp/skill/SKILL.md",
      sourcesDir: "/tmp/sources",
      outPath: "/tmp/out/review.json",
      base: "abc",
      head: "def",
    });
    assert.match(prompt, /Skip the npm version check/);
    assert.doesNotMatch(prompt, /step 1/);
    assert.match(prompt, /The CLI named in the skill is the local build/);
  });
});
