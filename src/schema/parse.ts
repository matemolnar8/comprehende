import * as z from "zod";
import { reviewDocumentSchema, type ReviewDocument } from "./review.ts";

export type ParseFailure = {
  ok: false;
  errors: string[];
};

export type ParseSuccess = {
  ok: true;
  document: ReviewDocument;
};

export type ParseResult = ParseSuccess | ParseFailure;

const UNKNOWN_FIELD_NOTE = "review documents may not store patch text or file contents";

export function parseReviewDocument(input: unknown): ParseResult {
  if (!isRecord(input)) {
    return { ok: false, errors: ["review document must be a JSON object"] };
  }
  const result = reviewDocumentSchema.safeParse(input);
  if (result.success) {
    return { ok: true, document: result.data };
  }
  return { ok: false, errors: formatZodIssues(result.error) };
}

export function parseReviewJson(text: string): ParseResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, errors: ["review document is not valid JSON"] };
  }
  return parseReviewDocument(value);
}

function formatZodIssues(error: z.ZodError): string[] {
  const errors: string[] = [];
  for (const issue of error.issues) {
    if (issue.code === "unrecognized_keys") {
      const where = formatPath(issue.path) || "document";
      for (const key of issue.keys) {
        errors.push(`${where} has unknown field "${key}" (${UNKNOWN_FIELD_NOTE})`);
      }
      continue;
    }
    const path = formatPath(issue.path);
    errors.push(path === "" ? issue.message : `${path} ${issue.message}`);
  }
  return errors;
}

function formatPath(path: PropertyKey[]): string {
  let out = "";
  for (const part of path) {
    if (typeof part === "number") {
      out += `[${part}]`;
    } else if (out === "") {
      out = String(part);
    } else {
      out += `.${String(part)}`;
    }
  }
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
