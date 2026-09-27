import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { isAbsolute } from "node:path";
import { describe, it } from "node:test";
import { configureSdkRipgrep, parseModelSpec } from "./agent.ts";

describe("model spec", () => {
  it("reads a bare id and id:param=value pairs", () => {
    assert.deepEqual(parseModelSpec("composer-2.5"), { id: "composer-2.5" });
    assert.deepEqual(parseModelSpec("grok-4.7:reasoning_effort=high,fast=false"), {
      id: "grok-4.7",
      params: [
        { id: "reasoning_effort", value: "high" },
        { id: "fast", value: "false" },
      ],
    });
    assert.throws(() => parseModelSpec("grok-4.6:effort"), /key=value/);
  });
});

describe("sdk ripgrep", () => {
  it("points CURSOR_RIPGREP_PATH at the bundled rg", () => {
    const previous = process.env.CURSOR_RIPGREP_PATH;
    delete process.env.CURSOR_RIPGREP_PATH;
    try {
      const path = configureSdkRipgrep();
      assert.ok(path);
      assert.equal(process.env.CURSOR_RIPGREP_PATH, path);
      assert.equal(isAbsolute(path), true);
      accessSync(path, constants.X_OK);
      const version = spawnSync(path, ["--version"], { encoding: "utf8" });
      assert.equal(version.status, 0);
      assert.match(version.stdout, /ripgrep/);
      configureSdkRipgrep();
      assert.equal(process.env.CURSOR_RIPGREP_PATH, path);
    } finally {
      if (previous === undefined) {
        delete process.env.CURSOR_RIPGREP_PATH;
      } else {
        process.env.CURSOR_RIPGREP_PATH = previous;
      }
    }
  });
});
