import * as z from "zod";
import { GRADER_TOOLS } from "./constants.ts";
import { runLocalAgent, type AgentRunResult } from "./agent.ts";
import { skillSection } from "./skill.ts";

const findingSchema = z.object({
  check: z.string().min(1),
  severity: z.enum(["major", "minor"]),
  where: z.string().min(1),
  hunk: z.string().min(1).optional(),
  note: z.string().min(1),
});

const claimSchema = z.object({
  claim: z.string().min(1),
  stated: z.boolean(),
  where: z.string().min(1).optional(),
});

const graderOutputSchema = z.object({
  findings: z.array(findingSchema),
  claims: z.array(claimSchema).optional(),
});

export type Finding = z.infer<typeof findingSchema>;
export type ClaimVerdict = z.infer<typeof claimSchema>;
export type GraderOutput = z.infer<typeof graderOutputSchema>;

export type GraderResult = {
  run: AgentRunResult;
  output: GraderOutput;
  parseError?: string;
};

export function parseGraderJson(text: string): GraderOutput {
  const candidates = [text.trim(), fencedJson(text), braceSlice(text)].filter((item) => item !== "");
  const errors: string[] = [];
  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      return graderOutputSchema.parse(parsed);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(`grader output is not valid JSON: ${errors[0] ?? "empty"}`);
}

export function groupingPrompt(opts: { skillMd: string; packetPath: string }): string {
  const rules = skillSection(opts.skillMd, "Grouping rules");
  return [
    "You grade a Comprehende review document against grouping rules. You do not rewrite the review.",
    "",
    "Rules:",
    rules,
    "",
    `Read the grading packet at ${opts.packetPath}. You may read files in the current git work tree to understand surrounding code. Do not run shell commands. Do not write files.`,
    "",
    "For each group, ask whether each hunk belongs to the concern the title and summary name, whether any group is a directory rather than a concern, whether any dependsOn is a false chain across stories, and whether mechanical work is folded into a story group.",
    "",
    "Reply with a JSON object only, no markdown fence:",
    '{"findings":[{"check":"concern|directory|dependsOn|mechanical|other","severity":"major|minor","where":"group id or document","hunk":"optional path","note":"one sentence"}]}',
    "Use an empty findings array when you see no issues.",
  ].join("\n");
}

export function prosePrompt(opts: { skillMd: string; packetPath: string; claims: string[] }): string {
  const why = skillSection(opts.skillMd, "The why");
  const what = skillSection(opts.skillMd, "The what");
  const lookFor = skillSection(opts.skillMd, "lookFor");
  const prose = skillSection(opts.skillMd, "Write the prose");
  const claimBlock =
    opts.claims.length === 0
      ? "There are no required claims. Omit the claims array."
      : `Required claims. For each, set stated true if the review states it, and quote where.\n${JSON.stringify(opts.claims, null, 2)}`;
  return [
    "You grade a Comprehende review document against the skill's prose rules. You do not rewrite the review.",
    "",
    "The why:",
    why,
    "",
    "The what:",
    what,
    "",
    "lookFor:",
    lookFor,
    "",
    "Write the prose:",
    prose,
    "",
    `Read the grading packet at ${opts.packetPath}. You may read files in the current git work tree. Do not run shell commands. Do not write files.`,
    "",
    "Ask whether document why says anything the frozen sources do not say, whether summaries are path lists, whether lookFor is padded or missing, and whether the prose is readable.",
    "",
    claimBlock,
    "",
    "Reply with a JSON object only, no markdown fence:",
    '{"findings":[{"check":"why|summary|lookFor|prose|claim|other","severity":"major|minor","where":"field or group id","note":"one sentence"}],"claims":[{"claim":"exact claim string","stated":true,"where":"optional location"}]}',
    "Use an empty findings array when you see no issues.",
  ].join("\n");
}

export async function runGrader(opts: {
  repoCwd: string;
  model: string;
  apiKey: string;
  sandbox: boolean;
  prompt: string;
}): Promise<GraderResult> {
  const first = await runLocalAgent({
    cwd: opts.repoCwd,
    model: opts.model,
    prompt: opts.prompt,
    apiKey: opts.apiKey,
    tools: GRADER_TOOLS,
    sandbox: opts.sandbox,
  });
  try {
    return { run: first, output: parseGraderJson(first.text) };
  } catch {
    const retry = await runLocalAgent({
      cwd: opts.repoCwd,
      model: opts.model,
      prompt: `${opts.prompt}\n\nYour previous reply was not valid JSON. Return only the JSON object, no markdown.`,
      apiKey: opts.apiKey,
      tools: GRADER_TOOLS,
      sandbox: opts.sandbox,
    });
    try {
      return { run: retry, output: parseGraderJson(retry.text) };
    } catch (error) {
      return {
        run: retry,
        output: { findings: [] },
        parseError: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

function fencedJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/u);
  return match?.[1]?.trim() ?? "";
}

function braceSlice(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return "";
  }
  return text.slice(start, end + 1);
}
