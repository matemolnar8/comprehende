import { DEFAULT_GRADER_MODEL, DEFAULT_PRODUCER_MODEL } from "./constants.ts";

export const EVAL_USAGE = `Usage: pnpm eval -- [options]

Grade Comprehende reviews. An isolated producer follows the next skill. Deterministic checks and two read-only graders then score the result. LLM findings do not change the exit code.

Options:
  --case <id>             Run this case (repeatable)
  --tag <tag>             Run cases with this tag
  --baseline <dir>        Print deltas against a previous eval/runs/<stamp>
  --json                  Also print summary.json to stdout
  --producer-model <id>   Default ${DEFAULT_PRODUCER_MODEL}
  --grader-model <id>     Default ${DEFAULT_GRADER_MODEL}
  --sandbox               Enable local sandboxOptions
  -h, --help

Needs CURSOR_API_KEY. Writes eval/runs/<stamp>/. Exit 1 only when a deterministic check fails.
`;

export const ADD_CASE_USAGE = `Usage: pnpm eval:add -- --pr <github pr url>

Fetch a pull request and write eval/cases/<repo>-<n>/ with frozen sources and empty expect.

Options:
  --pr <url>    GitHub pull request URL
  --id <id>     Case folder name (default: <repo>-<n>)
  -h, --help
`;

export type EvalRunRequest =
  | { kind: "help" }
  | { kind: "error"; message: string }
  | {
      kind: "run";
      ids: string[];
      tag?: string;
      baseline?: string;
      json: boolean;
      producerModel: string;
      graderModel: string;
      sandbox: boolean;
    };

export type AddCaseRequest =
  | { kind: "help" }
  | { kind: "error"; message: string }
  | { kind: "add"; prUrl: string; id?: string };

export function parseEvalArgv(argv: string[]): EvalRunRequest {
  const args = argv[0] === "--" ? argv.slice(1) : [...argv];
  if (args.includes("-h") || args.includes("--help")) {
    return { kind: "help" };
  }
  try {
    const ids: string[] = [];
    let tag: string | undefined;
    let baseline: string | undefined;
    let producerModel = DEFAULT_PRODUCER_MODEL;
    let graderModel = DEFAULT_GRADER_MODEL;
    let json = false;
    let sandbox = false;
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (arg === undefined) {
        continue;
      }
      if (arg === "--json") {
        json = true;
        continue;
      }
      if (arg === "--sandbox") {
        sandbox = true;
        continue;
      }
      if (arg === "--case" || arg === "--tag" || arg === "--baseline" || arg === "--producer-model" || arg === "--grader-model") {
        const value = args[i + 1];
        if (value === undefined || value.startsWith("-")) {
          throw new Error(`${arg} requires a value`);
        }
        i += 1;
        if (arg === "--case") {
          ids.push(value);
        } else if (arg === "--tag") {
          tag = value;
        } else if (arg === "--baseline") {
          baseline = value;
        } else if (arg === "--producer-model") {
          producerModel = value;
        } else {
          graderModel = value;
        }
        continue;
      }
      throw new Error(`Unknown option: ${arg}`);
    }
    return { kind: "run", ids, tag, baseline, json, producerModel, graderModel, sandbox };
  } catch (error) {
    return { kind: "error", message: error instanceof Error ? error.message : String(error) };
  }
}

export function parseAddCaseArgv(argv: string[]): AddCaseRequest {
  const args = argv[0] === "--" ? argv.slice(1) : [...argv];
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    return { kind: "help" };
  }
  try {
    let prUrl: string | undefined;
    let id: string | undefined;
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (arg === undefined) {
        continue;
      }
      if (arg === "--pr" || arg === "--id") {
        const value = args[i + 1];
        if (value === undefined || value.startsWith("-")) {
          throw new Error(`${arg} requires a value`);
        }
        i += 1;
        if (arg === "--pr") {
          prUrl = value;
        } else {
          id = value;
        }
        continue;
      }
      throw new Error(`Unknown option: ${arg}`);
    }
    if (prUrl === undefined) {
      throw new Error("--pr is required");
    }
    return { kind: "add", prUrl, id };
  } catch (error) {
    return { kind: "error", message: error instanceof Error ? error.message : String(error) };
  }
}
