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
};

type MuseEvent = {
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
  return { text, terminal, reason, toolCalls, steps };
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
    return {
      text: parsed.text,
      status: "finished",
      durationMs: Date.now() - started,
      tokens: 0,
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
