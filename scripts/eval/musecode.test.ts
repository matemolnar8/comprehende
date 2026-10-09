import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseExportUsage, parseMuseExecJsonl } from "./musecode.ts";

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

  it("captures the session id from the stream envelope", () => {
    const out = [
      JSON.stringify({
        schema_version: 1,
        stream: { kind: "session", id: "sess-1" },
        payload_type: "run.lifecycle.started",
        payload: { kind: "run_started" },
      }),
      terminal("completed", "DONE"),
    ].join("\n");
    assert.equal(parseMuseExecJsonl(out).sessionId, "sess-1");
  });

  it("leaves session id undefined when no session stream arrived", () => {
    const raw = JSON.stringify({
      payload_type: "p",
      payload: { kind: "run_terminal", terminal: "completed", text: "DONE", reason: null },
    });
    assert.equal(parseMuseExecJsonl(raw).sessionId, undefined);
  });

  it("keeps a non-completed terminal with its reason", () => {
    const parsed = parseMuseExecJsonl(terminal("failed", "partial", "boom"));
    assert.equal(parsed.terminal, "failed");
    assert.equal(parsed.reason, "boom");
    assert.equal(parsed.text, "partial");
  });

  it("skips blank lines and non-JSON banners", () => {
    const parsed = parseMuseExecJsonl(
      `\nmuse: workspace root: /tmp\n${terminal("completed", "DONE")}\n`,
    );
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

function exportRecord(usage: unknown): unknown {
  return {
    envelope: {
      payload_type: "runtime.session",
      payload: { kind: "run", event: { kind: "model_completed", usage, duration_ms: 9 } },
    },
  };
}

describe("muse export usage", () => {
  it("sums model_completed usage across completions", () => {
    const usage = parseExportUsage({
      events: [
        exportRecord({
          input_tokens: 100,
          output_tokens: 20,
          cached_tokens: 10,
          reasoning_tokens: 5,
        }),
        exportRecord({ input_tokens: 50, output_tokens: 7, cached_tokens: 0, reasoning_tokens: 0 }),
        { envelope: { payload: { event: { kind: "goal_usage_attribution" } } } },
      ],
    });
    assert.deepEqual(usage, {
      inputTokens: 150,
      outputTokens: 27,
      cachedTokens: 10,
      reasoningTokens: 5,
      completions: 2,
    });
  });

  it("returns zeros for missing or malformed documents", () => {
    const zero = {
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      reasoningTokens: 0,
      completions: 0,
    };
    assert.deepEqual(parseExportUsage(undefined), zero);
    assert.deepEqual(parseExportUsage({}), zero);
    assert.deepEqual(parseExportUsage({ events: "nope" }), zero);
    assert.deepEqual(parseExportUsage({ events: [exportRecord({ input_tokens: "x" })] }), {
      ...zero,
      completions: 1,
    });
  });
});
