import * as z from "zod";
import { TASK_TIMEOUT_MS } from "./constants.ts";
import { lastLine, runHeadless, toolDetail } from "./headless.ts";
import type { AgentRunResult, ToolCallRecord } from "./musecode.ts";

const count = z.number().int().nonnegative().catch(0).default(0);

const initEvent = z.object({
  type: z.literal("system"),
  subtype: z.literal("init"),
  session_id: z.string(),
});

const toolCallEvent = z.object({
  type: z.literal("tool_call"),
  subtype: z.literal("started"),
  call_id: z.string(),
  model_call_id: z.string().optional(),
  /** One key per tool kind (`shellToolCall`, `readToolCall`, ...) or `function`, next to plain fields. */
  tool_call: z.record(z.string(), z.unknown()),
});

const toolCallBody = z.looseObject({
  args: z.record(z.string(), z.unknown()).optional(),
  name: z.string().optional(),
});

/** `usage` is not in Cursor's output-format docs; the 2026.10 CLI writes it when the server reports tokens. */
const resultEvent = z.object({
  type: z.literal("result"),
  subtype: z.string(),
  is_error: z.boolean(),
  result: z.string().optional(),
  session_id: z.string().optional(),
  usage: z
    .object({
      inputTokens: count,
      outputTokens: count,
      cacheReadTokens: count,
      cacheWriteTokens: count,
    })
    .optional(),
});

const streamEvent = z.union([initEvent, toolCallEvent, resultEvent]);

export type CursorStreamResult = {
  steps: number;
  toolCalls: ToolCallRecord[];
  sessionId: string | undefined;
  result: z.infer<typeof resultEvent> | undefined;
};

/** Reads `cursor-agent -p --output-format stream-json` stdout. Unknown lines are skipped. */
export function parseCursorStreamJson(stdout: string): CursorStreamResult {
  const toolCalls: ToolCallRecord[] = [];
  const modelCalls = new Set<string>();
  let sessionId: string | undefined;
  let result: CursorStreamResult["result"];
  for (const line of stdout.split("\n")) {
    let json: unknown;
    try {
      json = JSON.parse(line);
    } catch {
      continue;
    }
    const event = streamEvent.safeParse(json);
    if (!event.success) {
      continue;
    }
    if (event.data.type === "system") {
      sessionId ??= event.data.session_id;
    } else if (event.data.type === "result") {
      result = event.data;
    } else {
      modelCalls.add(event.data.model_call_id ?? event.data.call_id);
      const call = toolCallOf(event.data.tool_call);
      if (call !== undefined) {
        toolCalls.push(call);
      }
    }
  }
  return {
    // Tool calls of one model call share its id. The final answer is one more model call.
    steps: modelCalls.size + (result === undefined ? 0 : 1),
    toolCalls,
    sessionId: result?.session_id ?? sessionId,
    result,
  };
}

function toolCallOf(toolCall: Record<string, unknown>): ToolCallRecord | undefined {
  for (const [key, value] of Object.entries(toolCall)) {
    const body = toolCallBody.safeParse(value);
    if (!body.success) {
      continue;
    }
    const kind = key.endsWith("ToolCall") ? key.slice(0, -"ToolCall".length) : undefined;
    const rawName = key === "function" ? body.data.name : kind;
    if (rawName === undefined || rawName === "") {
      continue;
    }
    const name = rawName.toLowerCase();
    const detail = toolDetail(body.data.args, ["command", "globPattern", "pattern", "path"]);
    return detail === undefined ? { name } : { name, detail };
  }
  return undefined;
}

/**
 * Headless `cursor-agent -p`. Uses only the Cursor CLI login: API key variables are removed
 * from the child environment. The prompt is the positional argument.
 */
export async function runCursorAgent(opts: {
  cwd: string;
  /** Passed to `--model` verbatim, bracket params included. */
  model: string;
  prompt: string;
  /** Folders outside cwd the agent reads or writes: the skill, sources, and output. */
  addDirs: readonly string[];
  timeoutMs?: number;
}): Promise<AgentRunResult> {
  const timeoutMs = opts.timeoutMs ?? TASK_TIMEOUT_MS;
  const started = Date.now();
  const args = [
    "-p",
    "--output-format",
    "stream-json",
    "--model",
    opts.model,
    "--force",
    "--trust",
    "--sandbox",
    "disabled",
    "--workspace",
    opts.cwd,
    ...opts.addDirs.flatMap((dir) => ["--add-dir", dir]),
    opts.prompt,
  ];
  const { CURSOR_API_KEY: _key, CURSOR_AUTH_TOKEN: _token, ...env } = process.env;
  const { code, stdout, stderr } = await runHeadless("cursor-agent", args, {
    cwd: opts.cwd,
    env,
    timeoutMs,
  });
  if (code === "timeout") {
    throw new Error(`agent timed out after ${timeoutMs}ms`);
  }
  const { steps, toolCalls, sessionId, result } = parseCursorStreamJson(stdout);
  const base = {
    text: result?.result ?? "",
    durationMs: Date.now() - started,
    steps,
    toolCalls,
    sessionId,
  };
  if (result === undefined || result.is_error || result.subtype !== "success") {
    return {
      ...base,
      status: "error",
      tokens: 0,
      error:
        result === undefined
          ? lastLine(stderr) || `cursor-agent exited ${String(code)} with no result event`
          : `cursor-agent run ended ${result.subtype}: ${(result.result ?? "").slice(0, 300)}`,
    };
  }
  const usage = result.usage;
  if (usage === undefined) {
    return { ...base, status: "finished", tokens: 0 };
  }
  // Cursor's inputTokens excludes cache reads and writes.
  const inputTokens = usage.inputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
  return {
    ...base,
    status: "finished",
    tokens: inputTokens + usage.outputTokens,
    inputTokens,
    outputTokens: usage.outputTokens,
    cacheReadTokens: usage.cacheReadTokens,
  };
}
