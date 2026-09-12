import * as z from "zod";
import { sourceCitationErrors } from "./source.ts";
import { REVIEW_SIZES, SOURCE_KINDS } from "./types.ts";

const SCHEMA_ID = "https://github.com/matemolnar8/comprehende/src/schema/review.schema.json";
const COMMENT_ONLY_KEYS = ["author", "body", "path", "side", "line"] as const;

function objectError(iss: { code?: string }): string | undefined {
  return iss.code === "invalid_type" ? "must be an object" : undefined;
}

function nonemptyString(description?: string) {
  const schema = z
    .string({ error: () => "must be a string" })
    .min(1, { error: "must be a non-empty string" })
    .refine((value) => value.trim() !== "", { error: "must be a non-empty string" });
  return description === undefined ? schema : schema.meta({ description });
}

function anyString(description?: string) {
  const schema = z.string({ error: () => "must be a string" });
  return description === undefined ? schema : schema.meta({ description });
}

function nonemptyInt() {
  return z
    .int({ error: "must be a non-negative integer" })
    .nonnegative({ error: "must be a non-negative integer" });
}

function stringList(description?: string) {
  const schema = z.array(nonemptyString(), { error: "must be an array of strings" });
  return description === undefined ? schema.optional() : schema.optional().meta({ description });
}

function addIssue(ctx: z.core.ParsePayload<unknown>, message: string, path: PropertyKey[] = []): void {
  ctx.issues.push({
    code: "custom",
    message,
    path,
    input: ctx.value,
  });
}

const hunkRefSchema = z
  .strictObject(
    {
      path: nonemptyString(),
      oldPath: nonemptyString().optional(),
      oldStart: nonemptyInt(),
      oldLines: nonemptyInt(),
      newStart: nonemptyInt(),
      newLines: nonemptyInt(),
    },
    { error: objectError },
  )
  .meta({
    id: "hunkRef",
    description: "Copy from comprehende index. Identity is (path, oldStart, newStart), plus oldPath when renamed.",
  });

const reviewSourceSchema = z.strictObject(
  {
    baseRef: nonemptyString(),
    headRef: nonemptyString(),
    range: nonemptyString().optional(),
  },
  { error: objectError },
);

const sourceShape = z.strictObject(
  {
    id: nonemptyString(),
    kind: z.enum(SOURCE_KINDS, { error: () => `must be one of ${SOURCE_KINDS.join(", ")}` }),
    label: nonemptyString("Short name shown in the UI. Examples: #24, alice on PR #32, Cursor session · Aug 12."),
    url: nonemptyString("Omit for transcripts.").optional(),
    title: nonemptyString().optional(),
    gist: nonemptyString("One or two sentences, written by the skill, saying why this source matters.").optional(),
    part: nonemptyString(
      "Short name of the independent story this source belongs to. Same name as the groups in that story.",
    ).optional(),
    author: nonemptyString("pr-comment only.").optional(),
    body: anyString("pr-comment only. The comment, faithful.").optional(),
    path: nonemptyString("pr-comment only. Git path. With side and line, pins the comment to live git.").optional(),
    side: z
      .enum(["old", "new"], { error: "must be old or new" })
      .meta({ description: "pr-comment only. Git-shaped, not GitHub-shaped." })
      .optional(),
    line: z
      .int({ error: "must be a positive integer" })
      .min(1, { error: "must be a positive integer" })
      .meta({ description: "pr-comment only. 1-based line on that side." })
      .optional(),
  },
  { error: objectError },
);

const sourceSchema = sourceShape.check(sourceRules).meta({ id: "source" });

function sourceRules(ctx: z.core.ParsePayload<z.infer<typeof sourceShape>>): void {
  const source = ctx.value;
  if (source.kind === "transcript" && source.url !== undefined) {
    addIssue(ctx, "must be omitted for transcripts", ["url"]);
  }
  if (source.kind !== "pr-comment") {
    for (const key of COMMENT_ONLY_KEYS) {
      if (source[key] !== undefined) {
        addIssue(ctx, "is only valid on pr-comment sources", [key]);
      }
    }
    return;
  }
  if (source.author === undefined) {
    addIssue(ctx, "is required on pr-comment sources", ["author"]);
  }
  if (source.body === undefined) {
    addIssue(ctx, "is required on pr-comment sources", ["body"]);
  }
  const pinCount = [source.path, source.side, source.line].filter((item) => item !== undefined).length;
  if (pinCount > 0 && pinCount !== 3) {
    addIssue(ctx, "line pin needs path, side, and line together");
  }
}

const groupSchema = z.strictObject(
  {
    id: nonemptyString(),
    title: nonemptyString(),
    why: nonemptyString(
      "Generated why this group exists. From a source when one applies, or that it enables later groups in the same story.",
    ),
    summary: anyString("One sentence: what this group is."),
    lookFor: stringList("Scannable bullets of what to inspect."),
    dependsOn: stringList("Ids of earlier groups this one depends on. Same story only."),
    part: nonemptyString(
      "Short name of the independent story this group belongs to. Same name = same story. Different names could have been separate PRs.",
    ).optional(),
    sources: stringList("Ids of document sources this group names, even when the prose does not cite them inline."),
    suggestedOrder: z
      .number({ error: "must be a finite number" })
      .finite({ error: "must be a finite number" }),
    hunkRefs: z.array(hunkRefSchema, { error: "must be an array" }),
  },
  { error: objectError },
);

// TODO: drop legacy tickets support in 0.7.0; use sources instead.
const legacyTicketSchema = z.strictObject(
  {
    id: nonemptyString(),
    url: nonemptyString().optional(),
    title: nonemptyString().optional(),
    part: nonemptyString().optional(),
  },
  { error: objectError },
);

const reviewDocumentObject = z
  .strictObject(
    {
      version: z.literal(1, { error: "must be 1" }),
      size: z.enum(REVIEW_SIZES, { error: () => `must be one of ${REVIEW_SIZES.join(", ")}` }).meta({
        description: "Human review burden of this change.",
      }),
      source: reviewSourceSchema,
      title: nonemptyString("Short name of the whole change. Prefer a user-created title when it names this change."),
      summary: nonemptyString("Short what of the whole change. Name the stories."),
      why: nonemptyString(
        "Generated why for the whole change, from tickets, issues, a request description, or a transcript. Cite sources with [text](source:id).",
      ).optional(),
      sources: z
        .array(sourceSchema, { error: "must be an array" })
        .optional()
        .meta({
          description:
            "Locators the skill read to write its prose. Ticket bodies, PR descriptions, and transcript text stay out. PR comment body is copied.",
        }),
      lookFor: stringList(
        "Whole-change and missing-work claims. Cite the source. Do not store a pass/fail.",
      ),
      groups: z.array(groupSchema, { error: "must be an array" }),
    },
    { error: objectError },
  )
  .meta({
    title: "Comprehende ReviewDocument",
    description: "Interpretation only: title, groups, summaries, and hunk pointers.",
  });

const reviewDocumentInput = reviewDocumentObject.extend({
  tickets: z.array(legacyTicketSchema, { error: "must be an array" }).optional(),
});

export const reviewDocumentSchema = reviewDocumentInput.check(documentRules).transform((document) => {
  const { tickets, ...rest } = document;
  if (tickets === undefined || rest.sources !== undefined) {
    return rest;
  }
  return { ...rest, sources: tickets.map(ticketToSource) };
});

function ticketToSource(ticket: z.infer<typeof legacyTicketSchema>): Source {
  const source: Source = { id: ticket.id, kind: "ticket", label: ticket.id };
  if (ticket.url !== undefined) {
    source.url = ticket.url;
  }
  if (ticket.title !== undefined) {
    source.title = ticket.title;
  }
  if (ticket.part !== undefined) {
    source.part = ticket.part;
  }
  return source;
}

function documentRules(ctx: z.core.ParsePayload<z.infer<typeof reviewDocumentInput>>): void {
  const document = ctx.value;
  if (document.sources !== undefined && document.tickets !== undefined) {
    addIssue(ctx, "document has both sources and tickets; use sources");
  }
  const sources = document.sources ?? document.tickets?.map(ticketToSource);
  collectDuplicateIds(
    ctx,
    (document.sources ?? document.tickets ?? []).map((item) => item.id),
    "source",
  );
  collectDuplicateIds(
    ctx,
    document.groups.map((group) => group.id),
    "group",
  );
  const knownGroups = new Set(document.groups.map((group) => group.id));
  const knownSources = new Set((sources ?? []).map((source) => source.id));
  for (const group of document.groups) {
    for (const dep of group.dependsOn ?? []) {
      if (dep === group.id) {
        addIssue(ctx, `groups id "${group.id}" depends on itself`);
      } else if (!knownGroups.has(dep)) {
        addIssue(ctx, `groups id "${group.id}" dependsOn unknown group "${dep}"`);
      }
    }
    const seen = new Set<string>();
    for (const sourceId of group.sources ?? []) {
      if (seen.has(sourceId)) {
        addIssue(ctx, `groups id "${group.id}" lists source "${sourceId}" twice`);
      }
      seen.add(sourceId);
      if (!knownSources.has(sourceId)) {
        addIssue(ctx, `groups id "${group.id}" sources unknown id "${sourceId}"`);
      }
    }
  }
  const { tickets: _tickets, ...rest } = document;
  for (const error of sourceCitationErrors({ ...rest, sources })) {
    addIssue(ctx, error);
  }
}

function collectDuplicateIds(ctx: z.core.ParsePayload<unknown>, ids: string[], kind: "source" | "group"): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      addIssue(ctx, `duplicate ${kind} id "${id}"`);
    }
    seen.add(id);
  }
}

export type HunkRef = z.infer<typeof hunkRefSchema>;
export type ReviewSource = z.infer<typeof reviewSourceSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type ReviewGroup = z.infer<typeof groupSchema>;
export type ReviewDocument = z.infer<typeof reviewDocumentSchema>;

export function reviewJsonSchema(): Record<string, unknown> {
  const schema = z.toJSONSchema(reviewDocumentObject, {
    override(ctx) {
      if (ctx.jsonSchema.maximum === Number.MAX_SAFE_INTEGER) {
        delete ctx.jsonSchema.maximum;
      }
    },
  }) as Record<string, unknown>;
  const { $schema, ...rest } = schema;
  return {
    $schema,
    $id: SCHEMA_ID,
    ...rest,
  };
}

export function reviewJsonSchemaText(): string {
  return `${JSON.stringify(reviewJsonSchema(), null, 2)}\n`;
}
