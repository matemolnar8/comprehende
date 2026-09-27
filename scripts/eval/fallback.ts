import { RateLimitError } from "@cursor/sdk";
import { runLocalAgent, type AgentRunResult } from "./agent.ts";
import { GRADER_TOOLS } from "./constants.ts";

export const CURSOR_PROBE_TIMEOUT_MS = 120_000;
const PROBE_PROMPT = "Reply with exactly: OK";

export type CursorProbe =
  | { ok: true }
  | { ok: false; limit: boolean; reason: string };

export function isUsageLimitMessage(message: string): boolean {
  return /rate.?limit|usage.?limit|too many requests|\b429\b|quota/i.test(message);
}

/** Thrown SDK errors and error-status results both land here. */
export function classifyCursorProbe(outcome: { thrown?: unknown; result?: AgentRunResult }): CursorProbe {
  if (outcome.thrown !== undefined) {
    const message = outcome.thrown instanceof Error ? outcome.thrown.message : String(outcome.thrown);
    return {
      ok: false,
      limit: outcome.thrown instanceof RateLimitError || isUsageLimitMessage(message),
      reason: message,
    };
  }
  const result = outcome.result;
  if (result !== undefined && result.status === "finished" && result.error === undefined) {
    return { ok: true };
  }
  const reason = result?.error ?? `producer status ${result?.status ?? "unknown"}`;
  return { ok: false, limit: isUsageLimitMessage(reason), reason };
}

/** One tiny Cursor run. Any failure means the account cannot serve this eval. */
export async function probeCursorAgent(opts: {
  apiKey: string;
  model: string;
  cwd: string;
}): Promise<CursorProbe> {
  try {
    const result = await runLocalAgent({
      cwd: opts.cwd,
      model: opts.model,
      prompt: PROBE_PROMPT,
      apiKey: opts.apiKey,
      tools: [...GRADER_TOOLS],
      sandbox: false,
      timeoutMs: CURSOR_PROBE_TIMEOUT_MS,
    });
    return classifyCursorProbe({ result });
  } catch (error) {
    return classifyCursorProbe({ thrown: error });
  }
}
