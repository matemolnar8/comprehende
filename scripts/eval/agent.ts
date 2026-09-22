import { Agent, type ConversationStep, type ToolName } from "@cursor/sdk";
import { TASK_TIMEOUT_MS } from "./constants.ts";

export type ToolCallRecord = {
  name: string;
  detail?: string;
};

export type AgentRunResult = {
  text: string;
  status: "finished" | "error" | "cancelled";
  durationMs: number;
  tokens: number;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  steps: number;
  toolCalls: ToolCallRecord[];
  error?: string;
};

export async function runLocalAgent(opts: {
  cwd: string;
  model: string;
  prompt: string;
  apiKey: string;
  tools?: readonly ToolName[];
  disallowedTools?: readonly ToolName[];
  sandbox: boolean;
  timeoutMs?: number;
}): Promise<AgentRunResult> {
  const timeoutMs = opts.timeoutMs ?? TASK_TIMEOUT_MS;
  await using agent = await Agent.create({
    apiKey: opts.apiKey,
    name: "comprehende-eval",
    model: { id: opts.model },
    ...(opts.tools !== undefined ? { tools: [...opts.tools] } : {}),
    ...(opts.disallowedTools !== undefined ? { disallowedTools: [...opts.disallowedTools] } : {}),
    local: {
      cwd: opts.cwd,
      settingSources: [],
      ...(opts.sandbox ? { sandboxOptions: { enabled: true } } : {}),
    },
  });
  const toolCalls: ToolCallRecord[] = [];
  let steps = 0;
  const run = await agent.send(opts.prompt, {
    onStep: ({ step }) => {
      if (step.type === "assistantMessage") {
        steps += 1;
        return;
      }
      if (step.type === "toolCall") {
        toolCalls.push(toolCallRecord(step));
      }
    },
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      run.wait(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          void run.cancel();
          reject(new Error(`agent timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
    return {
      text: result.result ?? "",
      status: result.status,
      durationMs: result.durationMs ?? 0,
      tokens: result.usage?.totalTokens ?? 0,
      inputTokens: result.usage?.inputTokens,
      outputTokens: result.usage?.outputTokens,
      cacheReadTokens: result.usage?.cacheReadTokens,
      steps,
      toolCalls,
      error: result.error?.message,
    };
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

export function toolCallRecord(step: Extract<ConversationStep, { type: "toolCall" }>): ToolCallRecord {
  const msg = step.message;
  const name = msg.type;
  if (!("args" in msg)) {
    return { name };
  }
  const args = msg.args;
  const value =
    "command" in args && typeof args.command === "string"
      ? args.command
      : "path" in args && typeof args.path === "string"
        ? args.path
        : "globPattern" in args && typeof args.globPattern === "string"
          ? args.globPattern
          : "pattern" in args && typeof args.pattern === "string"
            ? args.pattern
            : undefined;
  const detail = clip(value);
  return detail === undefined ? { name } : { name, detail };
}

function clip(value: string | undefined): string | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  return value.length > 200 ? `${value.slice(0, 197)}...` : value;
}

export function isCliHuntCall(call: ToolCallRecord): boolean {
  const detail = call.detail ?? "";
  switch (call.name) {
    case "glob":
      return /dist|cli\/main|package\.json/i.test(detail);
    case "ls":
      return /(?:^|\/)dist(?:\/|$)|(?:^|\/)cli(?:\/|$)/.test(detail);
    case "grep":
      return /dist|cli\/main|comprehende/i.test(detail);
    case "read":
      return /(?:^|\/)dist\/|cli\/main\.js/.test(detail);
    case "shell":
      return (
        /(?:\bls\b|\bfind\b|\bwhich\b|\btype\b|\bglob\b).{0,80}(?:dist|comprehende|cli\/main)/i.test(detail) ||
        /(?:pnpm|npm)\s+(?:run\s+)?build\b/.test(detail) ||
        /npm pack/.test(detail)
      );
    default:
      return false;
  }
}
