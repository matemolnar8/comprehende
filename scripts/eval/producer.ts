import { CLAUDE_EFFORTS, runClaudeCodeAgent, type ClaudeEffort } from "./claudecode.ts";
import { runMuseCodeAgent, type AgentRunResult } from "./musecode.ts";

/** A `claude-*` model runs in Claude Code with its own login; any other model runs in Muse Code. */
export type Producer =
  | { agent: "muse"; model: string }
  | { agent: "claude"; model: string; effort: ClaudeEffort | undefined };

export function parseProducer(model: string, effort: string | undefined): Producer {
  if (!model.startsWith("claude-")) {
    if (effort !== undefined) {
      throw new Error("--producer-effort needs a claude-* --producer-model");
    }
    return { agent: "muse", model };
  }
  if (effort === undefined) {
    return { agent: "claude", model, effort };
  }
  const known = CLAUDE_EFFORTS.find((level) => level === effort);
  if (known === undefined) {
    throw new Error(`--producer-effort is one of ${CLAUDE_EFFORTS.join(", ")}, got ${effort}`);
  }
  return { agent: "claude", model, effort: known };
}

export function producerPrompt(opts: {
  repoCwd: string;
  skillMd: string;
  sourcesDir: string;
  outPath: string;
  base: string;
  head: string;
  cliPath: string;
}): string {
  const cli = `node ${opts.cliPath}`;
  return [
    `Read ${opts.skillMd} and follow it.`,
    `Review ${opts.base}...${opts.head} in the git work tree at ${opts.repoCwd}. Run every git and CLI command from that directory. Both refs are present there.`,
    `Skip the npm version check. The skill's \`${cli}\` command is the CLI. It is already built. Run that command as written. Do not search, glob, or rebuild another CLI.`,
    `The pull request description, linked issues, and review comments the skill calls sources are files in ${opts.sourcesDir}. Read them from disk.`,
    "Do not use gh or the network. Ignore other agent instruction files in this repository.",
    `Write review.json to ${opts.outPath}. Stop after validate exits 0. Do not run serve or export.`,
  ].join(" ");
}

export async function runProducer(opts: {
  repoCwd: string;
  producer: Producer;
  apiKey: string;
  prompt: string;
  addDirs: readonly string[];
  keep: boolean;
}): Promise<AgentRunResult> {
  if (opts.producer.agent === "claude") {
    return runClaudeCodeAgent({
      cwd: opts.repoCwd,
      model: opts.producer.model,
      effort: opts.producer.effort,
      prompt: opts.prompt,
      addDirs: opts.addDirs,
      persistSession: opts.keep,
    });
  }
  return runMuseCodeAgent({
    cwd: opts.repoCwd,
    model: opts.producer.model,
    prompt: opts.prompt,
    apiKey: opts.apiKey,
    readOnly: false,
  });
}
