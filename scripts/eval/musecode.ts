import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TASK_TIMEOUT_MS } from "./constants.ts";
import type { AgentRunResult, ToolCallRecord } from "./agent.ts";

export type MuseExecResult = {
  text: string;
  terminal: string;
  reason?: string;
  toolCalls: ToolCallRecord[];
  steps: number;
  sessionId?: string;
};

export type MuseUsage = {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  completions: number;
};

const ZERO_USAGE: MuseUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cachedTokens: 0,
  reasoningTokens: 0,
  completions: 0,
};

type MuseEvent = {
  stream?: {
    kind?: string;
    id?: string;
  };
  payload_type?: string;
  payload?: {
    kind?: string;
    terminal?: string;
    text?: string;
    reason?: string | null;
    event?: { kind?: string; operation?: string };
  };
};

export function parseMuseExecJsonl(stdout: string): MuseExecResult {
  const toolCalls: ToolCallRecord[] = [];
  let steps = 0;
  let terminal = "";
  let text = "";
  let reason: string | undefined;
  let sessionId: string | undefined;
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") {
      continue;
    }
    let event: MuseEvent;
    try {
      event = JSON.parse(trimmed) as MuseEvent;
    } catch {
      continue;
    }
    if (sessionId === undefined && event.stream?.kind === "session" && typeof event.stream.id === "string") {
      sessionId = event.stream.id;
    }
    const payload = event.payload;
    if (payload?.kind === "run_terminal") {
      terminal = payload.terminal ?? "";
      text = payload.text ?? "";
      reason = payload.reason ?? undefined;
      continue;
    }
    if (payload?.event?.kind === "side_effect_intent") {
      const operation = payload.event.operation ?? "";
      if (operation.startsWith("tool:")) {
        toolCalls.push({ name: operation.slice("tool:".length) });
      } else if (operation.startsWith("model.")) {
        steps += 1;
      }
    }
  }
  return { text, terminal, reason, toolCalls, steps, sessionId };
}

/**
 * Sum per-completion usage from a `muse export --session <id>` document.
 * `muse exec --json` streams progress events only; token counters live in
 * the durable session log as `model_completed` events, which the export
 * carries verbatim. Echo-provider legs report zeros, which sum to zero.
 */
export function parseExportUsage(document: unknown): MuseUsage {
  if (typeof document !== "object" || document === null || !("events" in document)) {
    return { ...ZERO_USAGE };
  }
  const events = (document as { events?: unknown }).events;
  if (!Array.isArray(events)) {
    return { ...ZERO_USAGE };
  }
  const total = { ...ZERO_USAGE };
  for (const record of events) {
    if (typeof record !== "object" || record === null) {
      continue;
    }
    const event = (record as { envelope?: { payload?: { event?: unknown } } }).envelope?.payload?.event;
    if (typeof event !== "object" || event === null) {
      continue;
    }
    const typed = event as { kind?: unknown; usage?: unknown };
    if (typed.kind !== "model_completed" || typeof typed.usage !== "object" || typed.usage === null) {
      continue;
    }
    const usage = typed.usage as Record<string, unknown>;
    total.inputTokens += toCount(usage.input_tokens);
    total.outputTokens += toCount(usage.output_tokens);
    total.cachedTokens += toCount(usage.cached_tokens);
    total.reasoningTokens += toCount(usage.reasoning_tokens);
    total.completions += 1;
  }
  return total;
}

function toCount(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

/** Offline `muse export --session <id>`. Returns zeros when the export fails. */
async function readMuseUsage(sessionId: string, cwd: string): Promise<MuseUsage> {
  const outPath = join(cwd, "usage-export.json");
  const code = await new Promise<number>((resolve) => {
    let child;
    try {
      child = spawn("muse", ["export", "--session", sessionId, "--out", outPath], {
        cwd,
        stdio: ["ignore", "ignore", "ignore"],
      });
    } catch {
      resolve(127);
      return;
    }
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve(124);
    }, 60_000);
    child.on("error", () => {
      clearTimeout(timer);
      resolve(127);
    });
    child.on("close", (exit) => {
      clearTimeout(timer);
      resolve(exit ?? 1);
    });
  });
  if (code !== 0) {
    return { ...ZERO_USAGE };
  }
  try {
    const { readFile } = await import("node:fs/promises");
    return parseExportUsage(JSON.parse(await readFile(outPath, "utf8")));
  } catch {
    return { ...ZERO_USAGE };
  }
}

/** Headless `muse exec`. Prompt travels in a file, the API key in stdin. */
export async function runMuseCodeAgent(opts: {
  cwd: string;
  model: string;
  prompt: string;
  apiKey: string;
  readOnly: boolean;
  timeoutMs?: number;
}): Promise<AgentRunResult> {
  const timeoutMs = opts.timeoutMs ?? TASK_TIMEOUT_MS;
  const started = Date.now();
  const tmp = await mkdtemp(join(tmpdir(), "comprehende-musecode-"));
  try {
    const promptPath = join(tmp, "prompt.txt");
    await writeFile(promptPath, opts.prompt);
    const args = [
      "exec",
      "--json",
      "--trust-workspace",
      "--prompt-file",
      promptPath,
      "--model",
      opts.model,
      ...(opts.readOnly ? ["--disable-approval", "--disable-shell", "--disable-write"] : ["--yolo"]),
      ...(opts.apiKey === "" ? [] : ["--api-key-stdin"]),
    ];
    const { code, stdout, stderr } = await spawnMuse(args, opts.cwd, opts.apiKey, timeoutMs);
    if (code === "timeout") {
      throw new Error(`agent timed out after ${timeoutMs}ms`);
    }
    const parsed = parseMuseExecJsonl(stdout);
    if (code !== 0 && parsed.terminal === "") {
      return {
        text: parsed.text,
        status: "error",
        durationMs: Date.now() - started,
        tokens: 0,
        steps: parsed.steps,
        toolCalls: parsed.toolCalls,
        error: tail(stderr) || `muse exec exited ${String(code)}`,
      };
    }
    if (parsed.terminal !== "" && parsed.terminal !== "completed") {
      return {
        text: parsed.text,
        status: "error",
        durationMs: Date.now() - started,
        tokens: 0,
        steps: parsed.steps,
        toolCalls: parsed.toolCalls,
        error: parsed.reason ?? tail(stderr) ?? `muse run ended ${parsed.terminal}`,
      };
    }
    if (parsed.terminal === "") {
      return {
        text: parsed.text,
        status: "error",
        durationMs: Date.now() - started,
        tokens: 0,
        steps: parsed.steps,
        toolCalls: parsed.toolCalls,
        error: tail(stderr) ?? `muse exec exited ${String(code)} with no terminal event`,
      };
    }
    const usage = parsed.sessionId === undefined ? { ...ZERO_USAGE } : await readMuseUsage(parsed.sessionId, tmp);
    const inputTokens = usage.inputTokens;
    const outputTokens = usage.outputTokens;
    return {
      text: parsed.text,
      status: "finished",
      durationMs: Date.now() - started,
      tokens: inputTokens + outputTokens,
      inputTokens,
      outputTokens,
      cacheReadTokens: usage.cachedTokens,
      steps: parsed.steps,
      toolCalls: parsed.toolCalls,
    };
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

async function spawnMuse(
  args: string[],
  cwd: string,
  apiKey: string,
  timeoutMs: number,
): Promise<{ code: number | "timeout"; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value: { code: number | "timeout"; stdout: string; stderr: string }): void => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    let child;
    try {
      child = spawn("muse", args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
    } catch (error) {
      done({
        code: 127,
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
      });
      return;
    }
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      done({ code: 127, stdout, stderr: `${stderr}\n${error.message}` });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      done({ code: code ?? 1, stdout, stderr });
    });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      done({ code: "timeout", stdout, stderr });
    }, timeoutMs);
    if (args.includes("--api-key-stdin")) {
      child.stdin.write(apiKey, () => {
        child.stdin.end();
      });
    } else {
      child.stdin.end();
    }
  });
}

function tail(output: string): string | undefined {
  const lines = output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("muse:"));
  const last = lines.at(-1);
  return last === undefined || last === "" ? undefined : last.slice(-500);
}
