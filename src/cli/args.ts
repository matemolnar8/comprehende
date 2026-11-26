import { BATCH_CHARS } from "../review/batch.ts";

/** The flags each command reads. The parser rejects the rest, and each command's request type exposes only these. */
const COMMAND_FLAGS = {
  review: ["base", "head", "data"],
  validate: ["data"],
  serve: ["data", "port", "open"],
  export: ["data", "out"],
  digest: ["base", "head"],
  show: ["base", "head", "batch", "hunk", "file"],
  pregroup: ["base", "head", "data"],
  refresh: ["base", "head", "data"],
  theme: [],
} as const satisfies Record<string, readonly FlagName[]>;

export type CommandName = keyof typeof COMMAND_FLAGS;

type Flags = {
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
type FlagName = keyof Flags;

export type CommandRequest = {
  [C in CommandName]: { kind: "command"; command: C; cwd: string } & Pick<
    Flags,
    (typeof COMMAND_FLAGS)[C][number]
  >;
}[CommandName];

export type CliRequest =
  | { kind: "help" }
  | { kind: "version" }
  | { kind: "error"; message: string }
  | CommandRequest;

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

  theme     Check the UI themes and print the files they come from:
            .comprehende/theme.json in the repository and in the home folder.
            serve and export apply the repository one first; the Display menu
            switches between them.

Options:
  --base <ref>     Base ref (default: origin/HEAD, else main, master, or trunk)
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

  try {
    return { kind: "command", command, cwd, ...parseFlags(command, args.slice(1)) };
  } catch (error) {
    return { kind: "error", message: error instanceof Error ? error.message : String(error) };
  }
}

function isCommand(value: string): value is CommandName {
  return Object.hasOwn(COMMAND_FLAGS, value);
}

/** The first of repeated flags wins: the skill tells agents that `show` reads only its first `--hunk`. */
function parseFlags(command: CommandName, args: string[]): Flags {
  const accepted: readonly string[] = COMMAND_FLAGS[command];
  const values = new Map<string, string>();
  let open = false;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i] ?? "";
    if (!arg.startsWith("--")) {
      throw new ArgError(`Unexpected argument: ${arg}\n\n${USAGE}`);
    }
    const eq = arg.indexOf("=");
    const name = arg.slice(2, eq === -1 ? undefined : eq);
    if (!accepted.includes(name)) {
      const takes =
        accepted.length === 0 ? "no options" : accepted.map((flag) => `--${flag}`).join(", ");
      throw new ArgError(`${command} does not take --${name}. It takes ${takes}.`);
    }
    if (name === "open") {
      if (eq !== -1) {
        throw new ArgError("--open takes no value");
      }
      open = true;
      continue;
    }
    const value = eq === -1 ? args[i + 1] : arg.slice(eq + 1);
    if (eq === -1) {
      i += 1;
    }
    if (value === undefined || value === "" || (eq === -1 && value.startsWith("-"))) {
      throw new ArgError(`--${name} requires a value`);
    }
    if (!values.has(name)) {
      values.set(name, value);
    }
  }

  const port = Number(values.get("port") ?? String(DEFAULT_PORT));
  if (!Number.isInteger(port) || port < 0) {
    throw new ArgError("--port must be a non-negative integer");
  }
  const batchValue = values.get("batch");
  const batch = batchValue === undefined ? undefined : Number(batchValue);
  if (batch !== undefined && (!Number.isInteger(batch) || batch < 1)) {
    throw new ArgError("--batch must be a positive integer");
  }
  return {
    base: values.get("base"),
    head: values.get("head"),
    data: values.get("data"),
    out: values.get("out"),
    hunk: values.get("hunk"),
    file: values.get("file"),
    batch,
    port,
    open,
  };
}
