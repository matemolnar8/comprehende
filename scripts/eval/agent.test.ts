import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseModelSpec } from "./agent.ts";

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
