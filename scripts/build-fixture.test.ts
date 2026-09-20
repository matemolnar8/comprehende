import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_PORT } from "../src/cli/args.ts";
import { fixtureCommands } from "./build-fixture.ts";

describe("fixture printout", () => {
  it("prints serve and export relative to the fixture cwd", () => {
    const printed = fixtureCommands({
      cwd: "/proj/fixtures/repo",
      packageRoot: "/proj",
      dataPath: "/proj/fixtures/example/review.json",
    });
    assert.equal(
      printed.serve,
      `node ../../dist/cli/main.js serve --data ../example/review.json --port ${DEFAULT_PORT}`,
    );
    assert.equal(
      printed.export,
      "node ../../dist/cli/main.js export --data ../example/review.json --out ../site",
    );
  });
});
