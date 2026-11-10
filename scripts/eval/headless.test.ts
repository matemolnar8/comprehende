import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { runHeadless } from "./headless.ts";

describe("runHeadless", () => {
  it("returns the exit when the child exits before it reads stdin", async () => {
    const result = await runHeadless("true", [], {
      cwd: process.cwd(),
      env: process.env,
      stdin: "x".repeat(10_000_000),
      timeoutMs: 10_000,
    });
    assert.equal(result.code, 0);
  });
});
