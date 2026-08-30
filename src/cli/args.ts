export type CommandName = "index" | "validate" | "serve" | "export";

export type CliRequest =
  | { kind: "help" }
  | { kind: "version" }
  | { kind: "error"; message: string }
  | {
      kind: "command";
      command: CommandName;
      cwd: string;
      base?: string;
      head?: string;
      data?: string;
      out?: string;
      port: number;
      open: boolean;
    };

const COMMANDS = new Set<CommandName>(["index", "validate", "serve", "export"]);

export const USAGE = `Usage: comprehende <command> [options]

Run inside the git repository under review. Cwd is the repo.

Commands:
  index     [--base <ref>] [--head <ref>]
            List hunk refs from live git (no patch text)

  validate  --data <review.json>
            Check schema, ref resolution, hunk coverage, and source citations

  serve     --data <review.json> [--port <n>] [--open]
            Serve the local UI on 127.0.0.1 (pins commit SHAs at start)

  export    --data <review.json> --out <dir>
            Write a static site (same UI + frozen git payloads). No server after that.

Options:
  --base <ref>     Base ref (default: origin/HEAD or main/master)
  --head <ref>     Head ref (default: HEAD)
  --data <path>    Review document path
  --out <dir>      Output directory for export
  --port <n>       Listen port (default: 4567, 0 for ephemeral)
  --open           Open the UI in a browser
  -h, --help       Show this help
  -v, --version    Show version

Diffs come from git objects at the pinned SHAs. The review document is interpretation only.
Serve resolves refs when it starts. A later checkout does not change that review.
`;

export function parseArgv(argv: string[], cwd = process.cwd()): CliRequest {
  const args = argv[0] === "--" ? argv.slice(1) : [...argv];
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    return { kind: "help" };
  }
  if (args.includes("-v") || args.includes("--version")) {
    return { kind: "version" };
  }

  const command = args[0];
  if (command === undefined) {
    return { kind: "help" };
  }
  if (!isCommand(command)) {
    return { kind: "error", message: `Unknown command: ${command}\n\n${USAGE}` };
  }

  const rest = args.slice(1);
  try {
    const port = Number(flag(rest, "--port") ?? "4567");
    if (!Number.isInteger(port) || port < 0) {
      throw new Error("--port must be a non-negative integer");
    }
    return {
      kind: "command",
      command,
      cwd,
      base: flag(rest, "--base"),
      head: flag(rest, "--head"),
      data: flag(rest, "--data"),
      out: flag(rest, "--out"),
      port,
      open: rest.includes("--open"),
    };
  } catch (error) {
    return { kind: "error", message: error instanceof Error ? error.message : String(error) };
  }
}

function isCommand(value: string): value is CommandName {
  return COMMANDS.has(value as CommandName);
}

function flag(args: string[], name: string): string | undefined {
  const prefix = `${name}=`;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === undefined) {
      continue;
    }
    if (arg === name) {
      const value = args[i + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new Error(`${name} requires a value`);
      }
      return value;
    }
    if (arg.startsWith(prefix)) {
      const value = arg.slice(prefix.length);
      if (value === "") {
        throw new Error(`${name} requires a value`);
      }
      return value;
    }
  }
  return undefined;
}
