import { hyphenRuns } from "./hyphen-runs.ts";
import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";

describe("hyphenRuns", () => {
  it("isolates each hyphenated word and keeps the text identical", () => {
    const title = "Multi-browser living-room tests";
    const runs = hyphenRuns(title);
    assert.deepEqual(runs, [
      { text: "Multi-browser", hyphenated: true },
      { text: " ", hyphenated: false },
      { text: "living-room", hyphenated: true },
      { text: " tests", hyphenated: false },
    ]);
    assert.equal(runs.map((run) => run.text).join(""), title);
  });

  it("keeps digits and multi-part words in one run, and leaves loose dashes alone", () => {
    assert.deepEqual(hyphenRuns("Fix e2e-run-3 - again"), [
      { text: "Fix ", hyphenated: false },
      { text: "e2e-run-3", hyphenated: true },
      { text: " - again", hyphenated: false },
    ]);
  });
});
