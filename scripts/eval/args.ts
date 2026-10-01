import {
  AGENT_KINDS,
  DEFAULT_GRADER_MODEL,
  DEFAULT_MUSECODE_MODEL,
  DEFAULT_PRODUCER_MODEL,
  type AgentKind,
} from "./constants.ts";

export const EVAL_USAGE = `Usage: pnpm eval -- [options]

Grade Comprehende reviews. An isolated producer follows the next skill. Deterministic checks score the result. Two read-only graders also score unless --no-graders. LLM findings do not change the exit code.

Options:
  --case <id>             Run this case (repeatable)
  --tag <tag>             Run cases with this tag
  --baseline <dir>        Print deltas against a previous eval/runs/<stamp>
  --rescore <dir>         Re-check eval/runs/<stamp> reviews. No producer, no graders, no API key
  --json                  Also print summary.json to stdout
  --producer-model <id>   Default ${DEFAULT_PRODUCER_MODEL}. Params: <id>:<param>=<value>,... (grok-4.6:effort=high)
  --grader-model <id>     Default ${DEFAULT_GRADER_MODEL}. Same param form
  --producer-agent <kind> Default cursor. musecode runs the producer in Muse Code
  --grader-agent <kind>    Default cursor. musecode runs the graders in Muse Code
  --musecode-model <id>   Default ${DEFAULT_MUSECODE_MODEL}. Used when an agent is musecode
  --cursor-fallback       Probe Cursor first; on any Cursor error run cursor roles in Muse Code
  --cli-login             Use the muse CLI login instead of MUSE_CODE_API_KEY (musecode agents only)
  --no-graders            Skip grouping and prose graders
  --sandbox               Enable local sandboxOptions (cursor agents only)
  -h, --help

Needs CURSOR_API_KEY unless --rescore, plus MUSE_CODE_API_KEY when an agent is musecode or --cursor-fallback is set. Pass --cli-login to use the muse CLI login instead of MUSE_CODE_API_KEY. Writes eval/runs/<stamp>/index.html. Exit 1 when validate fails or a deterministic expect misses. Prose lint is advisory.
`;

export const ADD_CASE_USAGE = `Usage: pnpm eval:add -- --pr <github pr url>

Fetch a pull request and write eval/cases/<repo>-<n>/ with frozen sources and empty expect.

Options:
  --pr <url>    GitHub pull request URL
  --id <id>     Case folder name (default: <repo>-<n>)
  --bundle      Also write repo.bundle (base tree plus base..head) so the run never clones the repo
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
      producerAgent: AgentKind;
      graderAgent: AgentKind;
      musecodeModel: string;
      cursorFallback: boolean;
      cliLogin: boolean;
      graders: boolean;
      sandbox: boolean;
      rescore?: string;
    };

export type AddCaseRequest =
  | { kind: "help" }
  | { kind: "error"; message: string }
  | { kind: "add"; prUrl: string; id?: string; bundle: boolean };

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
    let producerAgent: AgentKind = "cursor";
    let graderAgent: AgentKind = "cursor";
    let musecodeModel = DEFAULT_MUSECODE_MODEL;
    let cursorFallback = false;
    let cliLogin = false;
    let json = false;
    let sandbox = false;
    let graders = true;
    let rescore: string | undefined;
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
      if (arg === "--no-graders") {
        graders = false;
        continue;
      }
      if (arg === "--cursor-fallback") {
        cursorFallback = true;
        continue;
      }
      if (arg === "--cli-login") {
        cliLogin = true;
        continue;
      }
      if (
        arg === "--case" ||
        arg === "--tag" ||
        arg === "--baseline" ||
        arg === "--rescore" ||
        arg === "--producer-model" ||
        arg === "--grader-model" ||
        arg === "--producer-agent" ||
        arg === "--grader-agent" ||
        arg === "--musecode-model"
      ) {
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
        } else if (arg === "--rescore") {
          rescore = value;
        } else if (arg === "--producer-model") {
          producerModel = value;
        } else if (arg === "--grader-model") {
          graderModel = value;
        } else if (arg === "--producer-agent") {
          producerAgent = parseAgentKind(arg, value);
        } else if (arg === "--grader-agent") {
          graderAgent = parseAgentKind(arg, value);
        } else {
          musecodeModel = value;
        }
        continue;
      }
      throw new Error(`Unknown option: ${arg}`);
    }
    return {
      kind: "run",
      ids,
      tag,
      baseline,
      json,
      producerModel,
      graderModel,
      producerAgent,
      graderAgent,
      musecodeModel,
      cursorFallback,
      cliLogin,
      graders,
      sandbox,
      rescore,
    };
  } catch (error) {
    return { kind: "error", message: error instanceof Error ? error.message : String(error) };
  }
}

function parseAgentKind(flag: string, value: string): AgentKind {
  if ((AGENT_KINDS as readonly string[]).includes(value)) {
    return value as AgentKind;
  }
  throw new Error(`${flag} must be ${AGENT_KINDS.join(" or ")}, got "${value}"`);
}

export function parseAddCaseArgv(argv: string[]): AddCaseRequest {
  const args = argv[0] === "--" ? argv.slice(1) : [...argv];
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    return { kind: "help" };
  }
  try {
    let prUrl: string | undefined;
    let id: string | undefined;
    let bundle = false;
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (arg === undefined) {
        continue;
      }
      if (arg === "--bundle") {
        bundle = true;
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
    return { kind: "add", prUrl, id, bundle };
  } catch (error) {
    return { kind: "error", message: error instanceof Error ? error.message : String(error) };
  }
}
