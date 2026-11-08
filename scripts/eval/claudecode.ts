import { spawn } from "node:child_process";
import * as z from "zod";
import { TASK_TIMEOUT_MS } from "./constants.ts";
import type { AgentRunResult, ToolCallRecord } from "./musecode.ts";

export const CLAUDE_EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
export type ClaudeEffort = (typeof CLAUDE_EFFORTS)[number];

const count = z.number().int().nonnegative().catch(0).default(0);

const assistantEvent = z.object({
  type: z.literal("assistant"),
  message: z.object({
    id: z.string(),
    content: z.array(
      z.looseObject({
        type: z.string(),
        name: z.string().optional(),
        input: z.record(z.string(), z.unknown()).optional(),
      }),
    ),
  }),
});

const resultEvent = z.object({
  type: z.literal("result"),
  subtype: z.string(),
  is_error: z.boolean(),
  result: z.string().optional(),
  session_id: z.string().optional(),
  total_cost_usd: z.number().optional(),
  usage: z
    .object({
      input_tokens: count,
      cache_creation_input_tokens: count,
      cache_read_input_tokens: count,
      output_tokens: count,
      output_tokens_details: z.object({ thinking_tokens: count }).optional(),
    })
    .optional(),
});

const streamEvent = z.union([assistantEvent, resultEvent]);

export type ClaudeStreamResult = {
  steps: number;
  toolCalls: ToolCallRecord[];
  result: z.infer<typeof resultEvent> | undefined;
};

/** Reads `claude -p --output-format stream-json --verbose` stdout. Unknown lines are skipped. */
export function parseClaudeStreamJson(stdout: string): ClaudeStreamResult {
  const toolCalls: ToolCallRecord[] = [];
  const messageIds = new Set<string>();
  let result: ClaudeStreamResult["result"];
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
    if (event.data.type === "result") {
      result = event.data;
      continue;
    }
    messageIds.add(event.data.message.id);
    for (const block of event.data.message.content) {
      if (block.type === "tool_use" && block.name !== undefined) {
        const name = block.name.toLowerCase();
        const detail = detailOf(block.input);
        toolCalls.push(detail === undefined ? { name } : { name, detail });
      }
    }
  }
  return { steps: messageIds.size, toolCalls, result };
}

function detailOf(input: Record<string, unknown> | undefined): string | undefined {
  const value = [input?.command, input?.file_path, input?.pattern].find(
    (item): item is string => typeof item === "string" && item !== "",
  );
  if (value === undefined) {
    return undefined;
  }
  return value.length > 200 ? `${value.slice(0, 197)}...` : value;
}

/**
 * Headless `claude -p`. Uses only the Claude Code login: API key variables are removed
 * from the child environment. The prompt travels on stdin.
 */
export async function runClaudeCodeAgent(opts: {
  cwd: string;
  model: string;
  effort: ClaudeEffort | undefined;
  prompt: string;
  /** Folders outside cwd the agent reads or writes: the skill, sources, and output. */
  addDirs: readonly string[];
  /** Keep the session on disk so `claude --resume <sessionId>` can debrief it. */
  persistSession: boolean;
  timeoutMs?: number;
}): Promise<AgentRunResult> {
  const timeoutMs = opts.timeoutMs ?? TASK_TIMEOUT_MS;
  const started = Date.now();
  const args = [
    "-p",
    "--output-format",
    "stream-json",
    "--verbose",
    "--model",
    opts.model,
    ...(opts.effort === undefined ? [] : ["--effort", opts.effort]),
    "--dangerously-skip-permissions",
    "--disable-slash-commands",
    "--strict-mcp-config",
    ...(opts.persistSession ? [] : ["--no-session-persistence"]),
    ...opts.addDirs.flatMap((dir) => ["--add-dir", dir]),
  ];
  const { ANTHROPIC_API_KEY: _key, ANTHROPIC_AUTH_TOKEN: _token, ...env } = process.env;
  const { code, stdout, stderr } = await new Promise<{
    code: number | "timeout";
    stdout: string;
    stderr: string;
  }>((resolve) => {
    const child = spawn("claude", args, { cwd: opts.cwd, env, stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (chunk: Buffer) => {
      out += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      err += chunk.toString();
    });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ code: "timeout", stdout: out, stderr: err });
    }, timeoutMs);
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: 127, stdout: out, stderr: `${err}\n${error.message}` });
    });
    child.on("close", (exit) => {
      clearTimeout(timer);
      resolve({ code: exit ?? 1, stdout: out, stderr: err });
    });
    child.stdin.end(opts.prompt);
  });
  if (code === "timeout") {
    throw new Error(`agent timed out after ${timeoutMs}ms`);
  }
  const { steps, toolCalls, result } = parseClaudeStreamJson(stdout);
  const base = {
    text: result?.result ?? "",
    durationMs: Date.now() - started,
    steps,
    toolCalls,
    sessionId: result?.session_id,
    costUsd: result?.total_cost_usd,
  };
  if (result === undefined || result.is_error || result.subtype !== "success") {
    const lastErr = stderr.trim().split("\n").at(-1)?.slice(-500);
    return {
      ...base,
      status: "error",
      tokens: 0,
      error:
        result === undefined
          ? lastErr || `claude exited ${String(code)} with no result event`
          : `claude run ended ${result.subtype}`,
    };
  }
  const usage = result.usage;
  const inputTokens =
    (usage?.input_tokens ?? 0) +
    (usage?.cache_creation_input_tokens ?? 0) +
    (usage?.cache_read_input_tokens ?? 0);
  const outputTokens = usage?.output_tokens ?? 0;
  return {
    ...base,
    status: "finished",
    tokens: inputTokens + outputTokens,
    inputTokens,
    outputTokens,
    cacheReadTokens: usage?.cache_read_input_tokens ?? 0,
    reasoningTokens: usage?.output_tokens_details?.thinking_tokens,
  };
}
