import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import * as z from "zod";
import { REVIEW_SIZES, SOURCE_KINDS } from "../../src/schema/types.ts";

const nonemptyString = z.string().min(1);

const pathSet = z.array(nonemptyString).min(1);

const countRange = z.strictObject({
  min: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
});

const expectSchema = z
  .strictObject({
    why: z.enum(["present", "absent"]).optional(),
    parts: countRange.optional(),
    groups: countRange.optional(),
    size: z.array(z.enum(REVIEW_SIZES)).min(1).optional(),
    sourceKinds: z.array(z.enum(SOURCE_KINDS)).min(1).optional(),
    mechanicalPaths: pathSet.optional(),
    together: z.array(pathSet).optional(),
    apart: z.array(z.tuple([nonemptyString, nonemptyString])).optional(),
  })
  .optional();

const caseSchema = z.strictObject({
  id: nonemptyString,
  repo: nonemptyString,
  pr: z.number().int().positive(),
  base: nonemptyString,
  head: nonemptyString,
  tags: z.array(nonemptyString).default([]),
  expect: expectSchema,
});

const rubricSchema = z.strictObject({
  must: z.array(nonemptyString),
  good: z.array(nonemptyString),
  mustNot: z.array(nonemptyString),
});

export type EvalCase = z.infer<typeof caseSchema>;
export type EvalExpect = NonNullable<EvalCase["expect"]>;
export type Rubric = z.infer<typeof rubricSchema>;

export type ListedCase = { dir: string; spec: EvalCase; rubric: Rubric };

const RUBRIC_SECTIONS: { key: keyof Rubric; heading: string }[] = [
  { key: "must", heading: "## Must" },
  { key: "good", heading: "## Good" },
  { key: "mustNot", heading: "## Must not" },
];

/** The grader lists come from `expected.md`: one `- ` bullet per line under each heading. */
export function parseExpectedMd(text: string): Rubric {
  const lines = text.split("\n");
  const bullets = (heading: string): string[] => {
    const start = lines.findIndex((line) => line.trim() === heading);
    if (start === -1) {
      throw new Error(`expected.md is missing ${heading}`);
    }
    const items: string[] = [];
    for (const line of lines.slice(start + 1)) {
      if (line.startsWith("## ")) {
        break;
      }
      if (line.startsWith("- ")) {
        items.push(line.slice(2).trim());
      }
    }
    return items;
  };
  return rubricSchema.parse(
    Object.fromEntries(RUBRIC_SECTIONS.map(({ key, heading }) => [key, bullets(heading)])),
  );
}

export async function loadRubric(dir: string): Promise<Rubric> {
  let text: string;
  try {
    text = await readFile(join(dir, "expected.md"), "utf8");
  } catch {
    return { must: [], good: [], mustNot: [] };
  }
  try {
    return parseExpectedMd(text);
  } catch (error) {
    throw new Error(
      `${dir}/expected.md: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function parseEvalCase(value: unknown): EvalCase {
  return caseSchema.parse(value);
}

export function parseEvalCaseJson(text: string): EvalCase {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("case.json is not valid JSON");
  }
  return parseEvalCase(value);
}

export async function loadEvalCase(dir: string): Promise<EvalCase> {
  const loaded = parseEvalCaseJson(await readFile(join(dir, "case.json"), "utf8"));
  const folder = dir.replace(/\\/g, "/").split("/").pop();
  if (folder !== loaded.id) {
    throw new Error(`case id "${loaded.id}" does not match folder "${folder}"`);
  }
  return loaded;
}

export async function listEvalCases(casesDir: string): Promise<ListedCase[]> {
  const names = await readdir(casesDir, { withFileTypes: true });
  const loaded: ListedCase[] = [];
  for (const entry of names.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) {
      continue;
    }
    const dir = join(casesDir, entry.name);
    loaded.push({ dir, spec: await loadEvalCase(dir), rubric: await loadRubric(dir) });
  }
  return loaded;
}

export function selectEvalCases<T extends { spec: EvalCase }>(
  cases: T[],
  opts: { ids?: string[]; tag?: string },
): T[] {
  return cases.filter(({ spec }) => {
    if (opts.ids !== undefined && opts.ids.length > 0 && !opts.ids.includes(spec.id)) {
      return false;
    }
    if (opts.tag !== undefined && !spec.tags.includes(opts.tag)) {
      return false;
    }
    return true;
  });
}
