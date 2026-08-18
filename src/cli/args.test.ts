import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readPackageVersion } from "../package-root.ts";
import { parseArgv } from "./args.ts";
import { isCliEntry, run } from "./main.ts";

describe("parseArgv", () => {
  it("parses serve flags", () => {
    const req = parseArgv(["serve", "--data", "review.json", "--port", "0", "--open"], "/repo");
    assert.deepEqual(req, {
      kind: "command",
      command: "serve",
      cwd: "/repo",
      base: undefined,
      head: undefined,
      data: "review.json",
      out: undefined,
      port: 0,
      open: true,
    });
  });

  it("parses export flags", () => {
    const req = parseArgv(["export", "--data", "review.json", "--out", "dist/review"], "/repo");
    assert.deepEqual(req, {
      kind: "command",
      command: "export",
      cwd: "/repo",
      base: undefined,
      head: undefined,
      data: "review.json",
      out: "dist/review",
      port: 4567,
      open: false,
    });
  });

  it("rejects unknown commands", () => {
    const req = parseArgv(["frobnicate"]);
    assert.equal(req.kind, "error");
  });
});

describe("run", () => {
  it("prints help and version", async () => {
    const log = console.log;
    const err = console.error;
    const lines: string[] = [];
    console.log = (message?: unknown) => {
      lines.push(String(message));
    };
    console.error = (message?: unknown) => {
      lines.push(String(message));
    };
    try {
      assert.equal(await run(["--help"]), 0);
      assert.equal(await run(["--version"]), 0);
      assert.equal(await run(["nope"]), 1);
      const text = lines.join("\n");
      assert.match(text, /Usage: comprehende/);
      assert.match(text, /export/);
      assert.ok(text.includes(readPackageVersion()));
      assert.match(text, /Unknown command: nope/);
    } finally {
      console.log = log;
      console.error = err;
    }
  });
});

describe("isCliEntry", () => {
  it("accepts the npm bin shim and the built file", () => {
    assert.equal(isCliEntry("/tmp/dist/cli/main.js", "/tmp/node_modules/.bin/comprehende"), true);
    assert.equal(isCliEntry("/tmp/dist/cli/main.js", "/tmp/dist/cli/main.js"), true);
    assert.equal(isCliEntry("/tmp/src/cli/main.ts", "/tmp/src/cli/main.ts"), true);
    assert.equal(isCliEntry("/tmp/dist/cli/main.js", "/tmp/src/cli/args.test.ts"), false);
    assert.equal(isCliEntry("/tmp/dist/cli/main.js", undefined), false);
  });
});
