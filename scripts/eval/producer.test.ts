import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isCliHuntCall } from "./agent.ts";
import { producerPrompt } from "./producer.ts";

const prompt = producerPrompt({
  skillMd: "/tmp/skill/SKILL.md",
  sourcesDir: "/tmp/sources",
  outPath: "/tmp/out/review.json",
  base: "abc",
  head: "def",
  cliPath: "/repo/dist/cli/main.js",
});

describe("producer prompt", () => {
  it("names the injected CLI as a built fact", () => {
    assert.match(prompt, /The skill's `node \/repo\/dist\/cli\/main\.js` command is the CLI/);
    assert.match(prompt, /It is already built/);
    assert.match(prompt, /Do not search, glob, or rebuild another CLI/);
    assert.doesNotMatch(prompt, /local build/);
  });

  it("skips the npm version check without pinning it to step 1", () => {
    assert.match(prompt, /Skip the npm version check/);
    assert.doesNotMatch(prompt, /step 1/);
  });
});

describe("CLI hunt classifier", () => {
  it("flags path hunts and rebuilds, not review work", () => {
    assert.equal(isCliHuntCall({ name: "glob", detail: "**/*" }), false);
    assert.equal(isCliHuntCall({ name: "glob", detail: "**/dist/**" }), true);
    assert.equal(isCliHuntCall({ name: "ls", detail: "dist" }), true);
    assert.equal(isCliHuntCall({ name: "read", detail: "dist/cli/main.js" }), true);
    assert.equal(isCliHuntCall({ name: "shell", detail: "pnpm build" }), true);
    assert.equal(isCliHuntCall({ name: "read", detail: "/tmp/skill/SKILL.md" }), false);
    assert.equal(isCliHuntCall({ name: "shell", detail: "node /repo/dist/cli/main.js validate --data /tmp/out/review.json" }), false);
  });
});
