import { Agent, type ToolName } from "@cursor/sdk";
import { TASK_TIMEOUT_MS } from "./constants.ts";

export type AgentRunResult = {
  text: string;
  status: "finished" | "error" | "cancelled";
  durationMs: number;
  tokens: number;
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
  const run = await agent.send(opts.prompt);
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
      error: result.error?.message,
    };
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}
