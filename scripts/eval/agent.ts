import { accessSync, constants, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join } from "node:path";
import { Agent, type ConversationStep, type ModelSelection, type ToolName } from "@cursor/sdk";
import { TASK_TIMEOUT_MS } from "./constants.ts";

const require = createRequire(import.meta.url);

/**
 * Absolute path to a real rg. `@cursor/sdk` does not export `configureRipgrepPath`.
 * On local startup it reads `CURSOR_RIPGREP_PATH` and passes that path to the function.
 * Without it, ignore scans log "Ripgrep path not configured" when rg is not on PATH.
 */
export function configureSdkRipgrep(): string | undefined {
  const current = process.env.CURSOR_RIPGREP_PATH;
  if (current !== undefined && isAbsolute(current) && executableFile(current) !== undefined) {
    return current;
  }
  const sdkDir = cursorSdkDir();
  const bundled = sdkDir === undefined ? undefined : bundledRipgrep(sdkDir);
  if (bundled === undefined) {
    return undefined;
  }
  process.env.CURSOR_RIPGREP_PATH = bundled;
  return bundled;
}

function cursorSdkDir(): string | undefined {
  let dir: string;
  try {
    dir = dirname(realpathSync(require.resolve("@cursor/sdk")));
  } catch {
    return undefined;
  }
  for (;;) {
    if (readPackageName(dir) === "@cursor/sdk") {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return undefined;
    }
    dir = parent;
  }
}

function bundledRipgrep(sdkDir: string): string | undefined {
  const binary = process.platform === "win32" ? "rg.exe" : "rg";
  const pkg = `@cursor/sdk-${process.platform}-${process.arch}`;
  try {
    const fromSdk = createRequire(join(sdkDir, "package.json"));
    const pkgJson = fromSdk.resolve(`${pkg}/package.json`);
    const resolved = executableFile(join(dirname(pkgJson), "bin", binary));
    if (resolved !== undefined) {
      return resolved;
    }
  } catch {
    // pnpm links the optional platform package beside @cursor/sdk, outside Node lookup.
  }
  const folder = `sdk-${process.platform}-${process.arch}`;
  return executableFile(join(dirname(sdkDir), folder, "bin", binary));
}

function executableFile(path: string): string | undefined {
  try {
    accessSync(path, constants.X_OK);
    return realpathSync(path);
  } catch {
    return undefined;
  }
}

function readPackageName(dir: string): string | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null || !("name" in parsed)) {
    return undefined;
  }
  return typeof parsed.name === "string" ? parsed.name : undefined;
}

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

/** `id` or `id:param=value,param=value`, e.g. `grok-4.6:effort=high`. */
export function parseModelSpec(spec: string): ModelSelection {
  const [id = "", rest] = spec.split(":", 2);
  if (rest === undefined || rest === "") {
    return { id };
  }
  const params = rest.split(",").map((pair) => {
    const [key, value] = pair.split("=", 2);
    if (key === undefined || key === "" || value === undefined || value === "") {
      throw new Error(`model param must be key=value, got "${pair}" in "${spec}"`);
    }
    return { id: key, value };
  });
  return { id, params };
}

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
  configureSdkRipgrep();
  await using agent = await Agent.create({
    apiKey: opts.apiKey,
    name: "comprehende-eval",
    model: parseModelSpec(opts.model),
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
      return /(?:^|\/)dist(?:\/|$)|cli\/main/.test(detail);
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
