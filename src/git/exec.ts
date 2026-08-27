import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const GIT_DIR_VARS = new Set([
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  "GIT_COMMON_DIR",
  "GIT_PREFIX",
]);

/** Drop inherited git dir vars so `cwd` is the repository, including linked worktrees. */
export function gitEnv(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(base)) {
    if (value === undefined || GIT_DIR_VARS.has(key.toUpperCase())) {
      continue;
    }
    env[key] = value;
  }
  return env;
}

export class GitError extends Error {
  readonly args: string[];
  readonly stderr: string;
  readonly code: number | null;

  constructor(message: string, args: string[], stderr: string, code: number | null) {
    super(message);
    this.name = "GitError";
    this.args = args;
    this.stderr = stderr;
    this.code = code;
  }
}

export async function git(cwd: string, args: string[], opts?: { allowFail?: boolean }): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["-c", "core.quotepath=false", ...args], {
      cwd,
      env: gitEnv(),
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    const failure = asExecFailure(error);
    if (opts?.allowFail) {
      return failure.stdout;
    }
    throw gitFailure(args, failure);
  }
}

export async function gitBuffer(cwd: string, args: string[], opts?: { input?: Uint8Array }): Promise<Buffer> {
  try {
    const { stdout } = await execFileAsync("git", ["-c", "core.quotepath=false", ...args], {
      cwd,
      env: gitEnv(),
      encoding: "buffer",
      maxBuffer: 64 * 1024 * 1024,
      ...(opts?.input !== undefined ? { input: Buffer.from(opts.input) } : {}),
    });
    return stdout;
  } catch (error) {
    throw gitFailure(args, asExecFailure(error));
  }
}

export async function gitOk(cwd: string, args: string[]): Promise<boolean> {
  try {
    await git(cwd, args);
    return true;
  } catch {
    return false;
  }
}

type ExecFailure = {
  message: string;
  stdout: string;
  stderr: string;
  code: number | null;
};

function asExecFailure(error: unknown): ExecFailure {
  if (typeof error === "object" && error !== null) {
    const record = error as {
      message?: unknown;
      stdout?: unknown;
      stderr?: unknown;
      code?: unknown;
    };
    return {
      message: typeof record.message === "string" ? record.message : "git failed",
      stdout: bufferText(record.stdout),
      stderr: bufferText(record.stderr),
      code: typeof record.code === "number" ? record.code : null,
    };
  }
  return { message: "git failed", stdout: "", stderr: "", code: null };
}

function bufferText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Buffer) {
    return value.toString("utf8");
  }
  return "";
}

function gitFailure(args: string[], failure: ExecFailure): GitError {
  return new GitError(
    `git ${args.join(" ")} failed: ${failure.stderr.trim() || failure.message}`,
    args,
    failure.stderr,
    failure.code,
  );
}
