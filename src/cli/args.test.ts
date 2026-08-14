import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseArgv } from "./args.ts";
import { run } from "./main.ts";

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
      port: 0,
      open: true,
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
      assert.match(text, /0\.1\.0/);
      assert.match(text, /Unknown command: nope/);
    } finally {
      console.log = log;
      console.error = err;
    }
  });
});
