import * as z from "zod";
import type { ReviewDocument } from "../../src/schema/types.ts";
import type { Rubric } from "./case.ts";
import { GRADER_TIMEOUT_MS } from "./constants.ts";
import { runMuseCodeAgent, type AgentRunResult } from "./musecode.ts";

const itemVerdictSchema = z.object({
  yes: z.boolean(),
  quote: z.string().optional(),
});

const bulletVerdictSchema = z.object({
  holds: z.boolean(),
  note: z.string().optional(),
});

const rubricReplySchema = z.object({
  must: z.array(itemVerdictSchema),
  good: z.array(itemVerdictSchema),
  mustNot: z.array(itemVerdictSchema),
  bullets: z.array(bulletVerdictSchema),
});

export type ItemVerdict = z.infer<typeof itemVerdictSchema> & { item: string };
export type BulletVerdict = z.infer<typeof bulletVerdictSchema> & { where: string; bullet: string };

export type RubricOutput = {
  must: ItemVerdict[];
  good: ItemVerdict[];
  mustNot: ItemVerdict[];
  bullets: BulletVerdict[];
};

export type RubricCounts = {
  must: { yes: number; total: number };
  good: { yes: number; total: number };
  mustNot: { yes: number; total: number };
  bullets: { holds: number; total: number };
};

export type RubricResult = {
  run: AgentRunResult;
  output: RubricOutput;
  parseError?: string;
};

export type LookForBullet = { where: string; bullet: string };

export function lookForBullets(document: ReviewDocument): LookForBullet[] {
  const bullets = (document.lookFor ?? []).map((bullet) => ({ where: "document", bullet }));
  for (const group of document.groups) {
    for (const bullet of group.lookFor ?? []) {
      bullets.push({ where: `group ${group.id}`, bullet });
    }
  }
  return bullets;
}

export function emptyRubricOutput(): RubricOutput {
  return { must: [], good: [], mustNot: [], bullets: [] };
}

export function rubricCounts(output: RubricOutput): RubricCounts {
  const yes = (items: ItemVerdict[]): { yes: number; total: number } => ({
    yes: items.filter((item) => item.yes).length,
    total: items.length,
  });
  return {
    must: yes(output.must),
    good: yes(output.good),
    mustNot: yes(output.mustNot),
    bullets: {
      holds: output.bullets.filter((item) => item.holds).length,
      total: output.bullets.length,
    },
  };
}

/** The model answers by position. Zip its arrays back onto the rubric text. */
export function parseRubricReply(
  text: string,
  rubric: Rubric,
  bullets: LookForBullet[],
): RubricOutput {
  const reply = rubricReplySchema.parse(parseJsonReply(text));
  const zip = (
    name: string,
    items: string[],
    verdicts: ItemVerdict[] | z.infer<typeof itemVerdictSchema>[],
  ): ItemVerdict[] => {
    if (verdicts.length !== items.length) {
      throw new Error(`${name} has ${verdicts.length} verdicts for ${items.length} items`);
    }
    return items.map((item, i) => ({ item, ...verdicts[i]! }));
  };
  if (reply.bullets.length !== bullets.length) {
    throw new Error(`bullets has ${reply.bullets.length} verdicts for ${bullets.length} bullets`);
  }
  return {
    must: zip("must", rubric.must, reply.must),
    good: zip("good", rubric.good, reply.good),
    mustNot: zip("mustNot", rubric.mustNot, reply.mustNot),
    bullets: bullets.map((bullet, i) => ({ ...bullet, ...reply.bullets[i]! })),
  };
}

export function parseJsonReply(text: string): unknown {
  const candidates = [text.trim(), fencedJson(text), braceSlice(text)].filter(
    (item) => item !== "",
  );
  const errors: string[] = [];
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(`grader output is not valid JSON: ${errors[0] ?? "empty"}`);
}

export function rubricPrompt(opts: {
  rubric: Rubric;
  bullets: LookForBullet[];
  packet: string;
}): string {
  const list = (items: string[]): string =>
    items.length === 0 ? "(none)" : items.map((item, i) => `${i + 1}. ${item}`).join("\n");
  const n = {
    must: opts.rubric.must.length,
    good: opts.rubric.good.length,
    mustNot: opts.rubric.mustNot.length,
    bullets: opts.bullets.length,
  };
  return [
    "You grade one Comprehende review document against a rubric. You do not rewrite the review. You answer yes or no per item and quote the review where it applies.",
    "",
    "## Rubric",
    "",
    "Must (facts the review must state):",
    list(opts.rubric.must),
    "",
    "Good (facts that improve the review):",
    list(opts.rubric.good),
    "",
    "Must not (mistakes a review makes on this change):",
    list(opts.rubric.mustNot),
    "",
    "For each Must and Good item, answer yes when the review gives the reader the same fact in its own words, anywhere in its prose: document why, summary, lookFor, part summaries, group why, group summary, or group lookFor. Different wording and different symbol names still count. An item may carry more detail than the review, such as a second reason, a consequence, or a symbol name; the review still states it when it gives the main fact and says nothing that contradicts the rest. Answer no when the review is silent on the main fact, states the opposite, or states a weaker version that changes what the reader would conclude. On yes, quote the review sentence that states it.",
    "For each Must not item, answer yes when the review makes that mistake. On yes, quote the review text that shows it.",
    "",
    "## lookFor bullets the review wrote",
    "",
    list(opts.bullets.map((item) => `(${item.where}) ${item.bullet}`)),
    "",
    "For each bullet, holds is true when every factual claim in it is true of the code at head and of the frozen sources. Read the files in the work tree when the diffs in the packet are not enough to decide. A bullet that says a source says X when the source says something else does not hold. A bullet that describes code that is not at head does not hold. On false, write one sentence on what head or the source actually does.",
    "",
    "## Packet",
    "",
    "The grading packet is below. It has the review document, live diffs for each group, and the frozen sources. Start from this packet. Do not search for the review or the packet. You may read files in the current git work tree to check a bullet against the code. Read only the files that check needs. Do not run shell commands. Do not write files.",
    "",
    opts.packet,
    "",
    "## Reply",
    "",
    "Reply with a JSON object only, no markdown fence:",
    '{"must":[{"yes":true,"quote":"..."}],"good":[{"yes":false}],"mustNot":[{"yes":false}],"bullets":[{"holds":true},{"holds":false,"note":"..."}]}',
    `must has exactly ${n.must} entries, good ${n.good}, mustNot ${n.mustNot}, bullets ${n.bullets}, each in the order listed above. An empty list stays an empty array.`,
  ].join("\n");
}

export function shouldRetryGraderRun(run: AgentRunResult): boolean {
  return run.status === "finished" && run.text.trim() !== "";
}

export async function runRubricGrader(opts: {
  repoCwd: string;
  model: string;
  apiKey: string;
  rubric: Rubric;
  bullets: LookForBullet[];
  packet: string;
}): Promise<RubricResult> {
  const prompt = rubricPrompt(opts);
  const runOnce = (text: string): Promise<AgentRunResult> =>
    runMuseCodeAgent({
      cwd: opts.repoCwd,
      model: opts.model,
      prompt: text,
      apiKey: opts.apiKey,
      readOnly: true,
      timeoutMs: GRADER_TIMEOUT_MS,
    });
  const parse = (run: AgentRunResult): RubricOutput =>
    parseRubricReply(run.text, opts.rubric, opts.bullets);
  const first = await runOnce(prompt);
  try {
    return { run: first, output: parse(first) };
  } catch (error) {
    // Retry only when the model returned text that is not the expected JSON.
    // A stall or a transport error leaves empty text or an error status;
    // retrying that would spend another full grader timeout for the same outcome.
    if (!shouldRetryGraderRun(first)) {
      return {
        run: first,
        output: emptyRubricOutput(),
        parseError: first.error ?? "grader returned no text",
      };
    }
    const reason = error instanceof Error ? error.message : String(error);
    const retry = await runOnce(
      `${prompt}\n\nYour previous reply was rejected: ${reason}. Return only the JSON object, no markdown, with the exact entry counts.`,
    );
    try {
      return { run: retry, output: parse(retry) };
    } catch (retryError) {
      return {
        run: retry,
        output: emptyRubricOutput(),
        parseError: retryError instanceof Error ? retryError.message : String(retryError),
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
