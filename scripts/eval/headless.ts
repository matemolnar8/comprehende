import { spawn } from "node:child_process";

export type HeadlessOutput = { code: number | "timeout"; stdout: string; stderr: string };

/** Runs a headless agent CLI to exit or timeout. Without `stdin` the child gets an empty, closed stdin. */
export function runHeadless(
  command: string,
  args: readonly string[],
  opts: { cwd: string; env: NodeJS.ProcessEnv; stdin?: string; timeoutMs: number },
): Promise<HeadlessOutput> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: opts.cwd,
      env: opts.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
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
    }, opts.timeoutMs);
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: 127, stdout: out, stderr: `${err}\n${error.message}` });
    });
    child.on("close", (exit) => {
      clearTimeout(timer);
      resolve({ code: exit ?? 1, stdout: out, stderr: err });
    });
    child.stdin.end(opts.stdin ?? "");
  });
}

/** The first non-empty string among `keys` of a tool's input, clipped to 200 characters. */
export function toolDetail(
  input: Record<string, unknown> | undefined,
  keys: readonly string[],
): string | undefined {
  const value = keys
    .map((key) => input?.[key])
    .find((item): item is string => typeof item === "string" && item !== "");
  if (value === undefined) {
    return undefined;
  }
  return value.length > 200 ? `${value.slice(0, 197)}...` : value;
}

/** The last stderr line, for an error message. */
export function lastLine(stderr: string): string | undefined {
  return stderr.trim().split("\n").at(-1)?.slice(-500);
}
