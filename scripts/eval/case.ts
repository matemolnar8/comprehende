import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import * as z from "zod";
import { REVIEW_SIZES, SOURCE_KINDS } from "../../src/schema/types.ts";

const nonemptyString = z.string().min(1);

const pathSet = z.array(nonemptyString).min(1);

const expectSchema = z
  .strictObject({
    why: z.enum(["present", "absent"]).optional(),
    parts: z
      .strictObject({
        min: z.number().int().nonnegative(),
        max: z.number().int().nonnegative(),
      })
      .optional(),
    size: z.array(z.enum(REVIEW_SIZES)).min(1).optional(),
    sourceKinds: z.array(z.enum(SOURCE_KINDS)).min(1).optional(),
    mechanicalPaths: pathSet.optional(),
    together: z.array(pathSet).optional(),
    apart: z.array(z.tuple([nonemptyString, nonemptyString])).optional(),
    claims: z.array(nonemptyString).min(1).optional(),
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

export type EvalCase = z.infer<typeof caseSchema>;
export type EvalExpect = NonNullable<EvalCase["expect"]>;

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

export async function listEvalCases(casesDir: string): Promise<{ dir: string; spec: EvalCase }[]> {
  const names = await readdir(casesDir, { withFileTypes: true });
  const loaded: { dir: string; spec: EvalCase }[] = [];
  for (const entry of names.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) {
      continue;
    }
    const dir = join(casesDir, entry.name);
    loaded.push({ dir, spec: await loadEvalCase(dir) });
  }
  return loaded;
}

export function selectEvalCases(
  cases: { dir: string; spec: EvalCase }[],
  opts: { ids?: string[]; tag?: string },
): { dir: string; spec: EvalCase }[] {
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
