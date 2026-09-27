import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMuseExecJsonl } from "./musecode.ts";

function line(payload: unknown): string {
  return JSON.stringify({
    schema_version: 1,
    id: "x",
    stream: { kind: "session", id: "s" },
    sequence: 1,
    recorded_at: 1,
    record_type: "event",
    durability: "durable",
    causation_id: "c",
    payload_type: "p",
    payload_schema_version: 1,
    payload,
  });
}

function intent(operation: string): string {
  return line({ kind: "task_lifecycle", event: { kind: "side_effect_intent", operation } });
}

function terminal(terminal: string, text: string, reason: string | null = null): string {
  return line({ kind: "run_terminal", terminal, text, reason });
}

describe("muse exec JSONL", () => {
  it("reads the terminal text, tool calls, and model steps", () => {
    const out = [
      intent("tool:read_file"),
      intent("model.response"),
      intent("model.response"),
      intent("reminder.child_run"),
      terminal("completed", '{"findings":[]}'),
    ].join("\n");
    const parsed = parseMuseExecJsonl(out);
    assert.equal(parsed.terminal, "completed");
    assert.equal(parsed.text, '{"findings":[]}');
    assert.deepEqual(parsed.toolCalls, [{ name: "read_file" }]);
    assert.equal(parsed.steps, 2);
    assert.equal(parsed.reason, undefined);
  });

  it("keeps a non-completed terminal with its reason", () => {
    const parsed = parseMuseExecJsonl(terminal("failed", "partial", "boom"));
    assert.equal(parsed.terminal, "failed");
    assert.equal(parsed.reason, "boom");
    assert.equal(parsed.text, "partial");
  });

  it("skips blank lines and non-JSON banners", () => {
    const parsed = parseMuseExecJsonl(`\nmuse: workspace root: /tmp\n${terminal("completed", "DONE")}\n`);
    assert.equal(parsed.terminal, "completed");
    assert.equal(parsed.text, "DONE");
  });

  it("returns an empty terminal when no terminal event arrived", () => {
    const parsed = parseMuseExecJsonl(intent("tool:read_file"));
    assert.equal(parsed.terminal, "");
    assert.equal(parsed.text, "");
    assert.deepEqual(parsed.toolCalls, [{ name: "read_file" }]);
  });
});
