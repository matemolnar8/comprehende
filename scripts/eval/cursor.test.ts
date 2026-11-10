import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { parseCursorStreamJson } from "./cursor.ts";

const lines = [
  {
    type: "system",
    subtype: "init",
    apiKeySource: "login",
    cwd: "/repo",
    session_id: "c1",
    model: "GPT-5.5",
    permissionMode: "default",
  },
  {
    type: "user",
    message: { role: "user", content: [{ type: "text", text: "Read SKILL.md" }] },
    session_id: "c1",
  },
  {
    type: "tool_call",
    subtype: "started",
    call_id: "t1",
    model_call_id: "m1",
    tool_call: {
      shellToolCall: { args: { command: "node dist/cli/main.js digest", timeout: 30000 } },
      toolCallId: "t1",
    },
    session_id: "c1",
  },
  {
    type: "tool_call",
    subtype: "started",
    call_id: "t2",
    model_call_id: "m1",
    tool_call: { readToolCall: { args: { path: "a.ts" } } },
    session_id: "c1",
  },
  {
    type: "tool_call",
    subtype: "completed",
    call_id: "t2",
    model_call_id: "m1",
    tool_call: { readToolCall: { args: { path: "a.ts" }, result: { success: { content: "" } } } },
    session_id: "c1",
  },
  {
    type: "assistant",
    message: { role: "assistant", content: [{ type: "text", text: "Now I search." }] },
    model_call_id: "m2",
    session_id: "c1",
  },
  {
    type: "tool_call",
    subtype: "started",
    call_id: "t3",
    model_call_id: "m2",
    tool_call: { globToolCall: { args: { globPattern: "**/dist/**", targetDirectory: "." } } },
    session_id: "c1",
  },
  {
    type: "tool_call",
    subtype: "started",
    call_id: "t4",
    tool_call: { function: { name: "Custom_Tool", arguments: "{}" } },
    session_id: "c1",
  },
  "not json",
  {
    type: "result",
    subtype: "success",
    is_error: false,
    duration_ms: 1234,
    duration_api_ms: 1234,
    result: "done",
    session_id: "c1",
    request_id: "r1",
    usage: { inputTokens: 14, outputTokens: 50, cacheReadTokens: 400, cacheWriteTokens: 100 },
  },
].map((line) => (typeof line === "string" ? line : JSON.stringify(line)));

describe("cursor stream-json", () => {
  it("reads tool calls from started events with lowercase kind names", () => {
    const parsed = parseCursorStreamJson(lines.join("\n"));
    assert.deepEqual(parsed.toolCalls, [
      { name: "shell", detail: "node dist/cli/main.js digest" },
      { name: "read", detail: "a.ts" },
      { name: "glob", detail: "**/dist/**" },
      { name: "custom_tool" },
    ]);
  });

  it("counts one step per model call plus the final answer", () => {
    assert.equal(parseCursorStreamJson(lines.join("\n")).steps, 4);
  });

  it("reads the session, result text, and usage", () => {
    const parsed = parseCursorStreamJson(lines.join("\n"));
    assert.equal(parsed.sessionId, "c1");
    assert.equal(parsed.result?.result, "done");
    assert.deepEqual(parsed.result?.usage, {
      inputTokens: 14,
      outputTokens: 50,
      cacheReadTokens: 400,
      cacheWriteTokens: 100,
    });
  });

  it("keeps the init session id when the run never finished", () => {
    const parsed = parseCursorStreamJson(lines.slice(0, 4).join("\n"));
    assert.equal(parsed.result, undefined);
    assert.equal(parsed.sessionId, "c1");
  });

  it("accepts a result with no usage", () => {
    const parsed = parseCursorStreamJson(
      JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "ok" }),
    );
    assert.equal(parsed.result?.usage, undefined);
  });
});
