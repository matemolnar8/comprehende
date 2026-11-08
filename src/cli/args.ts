import { BATCH_CHARS } from "../review/batch.ts";

export type CommandName =
  | "review"
  | "validate"
  | "serve"
  | "export"
  | "digest"
  | "show"
  | "pregroup"
  | "refresh";

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
      hunk?: string;
      file?: string;
      batch?: number;
      port: number;
      open: boolean;
    };

const COMMANDS: ReadonlySet<string> = new Set<CommandName>([
  "review",
  "validate",
  "serve",
  "export",
  "digest",
  "show",
  "pregroup",
  "refresh",
]);

export const DEFAULT_PORT = 4567;

export class ArgError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArgError";
  }
}

export const USAGE = `Usage: comprehende <command> [options]

Run inside the git repository under review. Cwd is the repo.

Commands:
  review    [--base <ref>] [--head <ref>] --data <review.json>
            Write a covering skeleton (every hunk ref, stub prose). Does not
            invent a review. Fill title, groups, and summaries, then validate.

  digest    [--base <ref>] [--head <ref>]
            Print how many batches to read, a size guess, one line per changed
            file (kind, hunks, symbols), and one line per directory of renames.
            No patch text. Group from this; fetch patch with show.

  show      [--base <ref>] [--head <ref>] --batch <n> | --hunk <ref> | --file <path>
            Print the patch for one hunk (path@oldStart+newStart) or one file.
            --batch prints batch n of the files to read, about ${BATCH_CHARS.toLocaleString("en-US")}
            characters each. It skips renames and copies with no edits, moves,
            generated files, lockfiles, binaries, and repeats of the same change.
            Batch 1 lists the skipped files.

  pregroup  [--base <ref>] [--head <ref>] --data <review.json>
            Write a draft review: repeated changes, mechanical files, and the
            rest in one group. The size is a guess from changed lines. Accept,
            split, and write the prose.

  refresh   [--base <ref>] [--head <ref>] --data <review.json>
            Carry a review over to the commits its refs resolve to now. Refs
            follow their hunks, gone refs are dropped, new hunks land in a draft
            update group. Prints what changed, then rewrite the prose it names.

  validate  --data <review.json>
            Check schema, ref resolution, hunk coverage, and source citations

  serve     --data <review.json> [--port <n>] [--open]
            Serve the local UI on 127.0.0.1 (pins commit SHAs at start)

  export    --data <review.json> --out <dir>
            Write a static site (same UI + frozen git payloads). Highlighters only
            for languages in the review. No server after that.

Options:
  --base <ref>     Base ref (default: origin/HEAD or main/master)
  --head <ref>     Head ref (default: HEAD)
  --data <path>    Review document path
  --out <dir>      Output directory for export
  --batch <n>      Batch number for show (1-based)
  --port <n>       Listen port (default: ${DEFAULT_PORT}, 0 for ephemeral)
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
    const port = Number(flag(rest, "--port") ?? String(DEFAULT_PORT));
    if (!Number.isInteger(port) || port < 0) {
      throw new ArgError("--port must be a non-negative integer");
    }
    const batchFlag = flag(rest, "--batch");
    const batch = batchFlag === undefined ? undefined : Number(batchFlag);
    if (batch !== undefined && (!Number.isInteger(batch) || batch < 1)) {
      throw new ArgError("--batch must be a positive integer");
    }
    return {
      kind: "command",
      command,
      cwd,
      base: flag(rest, "--base"),
      head: flag(rest, "--head"),
      data: flag(rest, "--data"),
      out: flag(rest, "--out"),
      hunk: flag(rest, "--hunk"),
      file: flag(rest, "--file"),
      batch,
      port,
      open: rest.includes("--open"),
    };
  } catch (error) {
    return { kind: "error", message: error instanceof Error ? error.message : String(error) };
  }
}

function isCommand(value: string): value is CommandName {
  return COMMANDS.has(value);
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
        throw new ArgError(`${name} requires a value`);
      }
      return value;
    }
    if (arg.startsWith(prefix)) {
      const value = arg.slice(prefix.length);
      if (value === "") {
        throw new ArgError(`${name} requires a value`);
      }
      return value;
    }
  }
  return undefined;
}
