import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { parseClaudeStreamJson } from "./claudecode.ts";

const lines = [
  { type: "system", subtype: "init" },
  {
    type: "assistant",
    message: {
      id: "m1",
      content: [
        { type: "thinking", thinking: "" },
        { type: "tool_use", name: "Bash", input: { command: "node dist/cli/main.js digest" } },
      ],
    },
  },
  {
    type: "assistant",
    message: {
      id: "m1",
      content: [{ type: "tool_use", name: "Read", input: { file_path: "a.ts" } }],
    },
  },
  { type: "user", message: { content: [] } },
  "not json",
  {
    type: "result",
    subtype: "success",
    is_error: false,
    result: "done",
    session_id: "s1",
    total_cost_usd: 0.03,
    usage: {
      input_tokens: 14,
      cache_creation_input_tokens: 100,
      cache_read_input_tokens: 400,
      output_tokens: 50,
      output_tokens_details: { thinking_tokens: 30 },
    },
  },
].map((line) => (typeof line === "string" ? line : JSON.stringify(line)));

describe("claude stream-json", () => {
  it("counts one step per assistant message and lowercases tool names", () => {
    const parsed = parseClaudeStreamJson(lines.join("\n"));
    assert.equal(parsed.steps, 1);
    assert.deepEqual(parsed.toolCalls, [
      { name: "bash", detail: "node dist/cli/main.js digest" },
      { name: "read", detail: "a.ts" },
    ]);
    assert.equal(parsed.result?.usage?.output_tokens_details?.thinking_tokens, 30);
    assert.equal(parsed.result?.total_cost_usd, 0.03);
  });

  it("has no result when the run never finished", () => {
    assert.equal(parseClaudeStreamJson(lines.slice(0, 3).join("\n")).result, undefined);
  });
});
