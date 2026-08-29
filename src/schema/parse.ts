import {
  isReviewSize,
  isSourceKind,
  isSourceSide,
  REVIEW_SIZES,
  SOURCE_KINDS,
  type HunkRef,
  type ReviewDocument,
  type ReviewGroup,
  type ReviewSize,
  type ReviewSource,
  type Source,
  type SourceKind,
} from "./types.ts";

export type ParseFailure = {
  ok: false;
  errors: string[];
};

export type ParseSuccess = {
  ok: true;
  document: ReviewDocument;
};

export type ParseResult = ParseSuccess | ParseFailure;

const DOCUMENT_KEYS = new Set(["version", "source", "size", "title", "summary", "why", "tickets", "sources", "groups"]);
const SOURCE_KEYS = new Set(["baseRef", "headRef", "range"]);
const TICKET_KEYS = new Set(["id", "url", "title", "part"]);
const REVIEW_SOURCE_KEYS = new Set([
  "id",
  "kind",
  "label",
  "url",
  "title",
  "gist",
  "part",
  "author",
  "body",
  "path",
  "side",
  "line",
]);
const COMMENT_ONLY_KEYS = ["author", "body", "path", "side", "line"] as const;
const GROUP_KEYS = new Set([
  "id",
  "title",
  "why",
  "summary",
  "lookFor",
  "dependsOn",
  "part",
  "sources",
  "suggestedOrder",
  "hunkRefs",
]);
const HUNK_KEYS = new Set(["path", "oldPath", "oldStart", "oldLines", "newStart", "newLines"]);

export function parseReviewDocument(input: unknown): ParseResult {
  const errors: string[] = [];
  if (!isRecord(input)) {
    return { ok: false, errors: ["review document must be a JSON object"] };
  }

  extraKeys(input, DOCUMENT_KEYS, "document", errors);

  if (input.version !== 1) {
    errors.push("version must be 1");
  }

  const source = parseSource(input.source, errors);
  const size = parseSize(input.size, errors);
  const title = requiredString(input.title, "title", errors);
  const summary = requiredString(input.summary, "summary", errors);
  const sources = parseDocumentSources(input.sources, input.tickets, errors);
  const groups = parseGroups(input.groups, sources, errors);
  const why = input.why === undefined ? undefined : requiredString(input.why, "why", errors);

  if (errors.length > 0 || source === undefined || size === undefined || title === undefined || summary === undefined) {
    return { ok: false, errors };
  }

  const document: ReviewDocument = {
    version: 1,
    source,
    size,
    title,
    summary,
    groups,
  };
  if (why !== undefined) {
    document.why = why;
  }
  if (sources !== undefined) {
    document.sources = sources;
  }
  return { ok: true, document };
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

function parseSize(value: unknown, errors: string[]): ReviewSize | undefined {
  if (isReviewSize(value)) {
    return value;
  }
  errors.push(`size must be one of ${REVIEW_SIZES.join(", ")}`);
  return undefined;
}

function parseSource(value: unknown, errors: string[]): ReviewSource | undefined {
  if (!isRecord(value)) {
    errors.push("source must be an object");
    return undefined;
  }
  extraKeys(value, SOURCE_KEYS, "source", errors);
  const baseRef = requiredString(value.baseRef, "source.baseRef", errors);
  const headRef = requiredString(value.headRef, "source.headRef", errors);
  let range: string | undefined;
  if (value.range !== undefined) {
    range = requiredString(value.range, "source.range", errors);
  }
  if (baseRef === undefined || headRef === undefined) {
    return undefined;
  }
  const source: ReviewSource = { baseRef, headRef };
  if (range !== undefined) {
    source.range = range;
  }
  return source;
}

function parseDocumentSources(sourcesValue: unknown, ticketsValue: unknown, errors: string[]): Source[] | undefined {
  if (sourcesValue !== undefined && ticketsValue !== undefined) {
    errors.push("document has both sources and tickets; use sources");
  }
  if (sourcesValue !== undefined) {
    return parseSources(sourcesValue, errors);
  }
  if (ticketsValue !== undefined) {
    return parseLegacyTickets(ticketsValue, errors);
  }
  return undefined;
}

function parseSources(value: unknown, errors: string[]): Source[] | undefined {
  if (!Array.isArray(value)) {
    errors.push("sources must be an array");
    return undefined;
  }
  const sources: Source[] = [];
  const ids = new Set<string>();
  value.forEach((item, i) => {
    const source = parseSourceItem(item, `sources[${i}]`, errors);
    if (source === undefined) {
      return;
    }
    if (ids.has(source.id)) {
      errors.push(`duplicate source id "${source.id}"`);
    }
    ids.add(source.id);
    sources.push(source);
  });
  return sources;
}

function parseSourceItem(value: unknown, label: string, errors: string[]): Source | undefined {
  if (!isRecord(value)) {
    errors.push(`${label} must be an object`);
    return undefined;
  }
  extraKeys(value, REVIEW_SOURCE_KEYS, label, errors);
  const id = requiredString(value.id, `${label}.id`, errors);
  const kind = parseKind(value.kind, `${label}.kind`, errors);
  const sourceLabel = requiredString(value.label, `${label}.label`, errors);
  if (id === undefined || kind === undefined || sourceLabel === undefined) {
    return undefined;
  }
  const source: Source = { id, kind, label: sourceLabel };
  if (value.url !== undefined) {
    const url = requiredString(value.url, `${label}.url`, errors);
    if (url !== undefined) {
      source.url = url;
    }
  }
  if (value.title !== undefined) {
    const title = requiredString(value.title, `${label}.title`, errors);
    if (title !== undefined) {
      source.title = title;
    }
  }
  if (value.gist !== undefined) {
    const gist = requiredString(value.gist, `${label}.gist`, errors);
    if (gist !== undefined) {
      source.gist = gist;
    }
  }
  if (value.part !== undefined) {
    const part = requiredString(value.part, `${label}.part`, errors);
    if (part !== undefined) {
      source.part = part;
    }
  }
  if (kind === "transcript" && source.url !== undefined) {
    errors.push(`${label}.url must be omitted for transcripts`);
  }
  assignCommentFields(value, source, kind, label, errors);
  return source;
}

function assignCommentFields(
  value: Record<string, unknown>,
  source: Source,
  kind: SourceKind,
  label: string,
  errors: string[],
): void {
  const present = COMMENT_ONLY_KEYS.filter((key) => value[key] !== undefined);
  if (kind !== "pr-comment") {
    for (const key of present) {
      errors.push(`${label}.${key} is only valid on pr-comment sources`);
    }
    return;
  }
  if (value.author !== undefined) {
    const author = requiredString(value.author, `${label}.author`, errors);
    if (author !== undefined) {
      source.author = author;
    }
  }
  if (value.body !== undefined) {
    const body = requiredString(value.body, `${label}.body`, errors, { allowEmpty: true });
    if (body !== undefined) {
      source.body = body;
    }
  }
  if (source.author === undefined) {
    errors.push(`${label}.author is required on pr-comment sources`);
  }
  if (source.body === undefined) {
    errors.push(`${label}.body is required on pr-comment sources`);
  }
  const pinCount = [value.path, value.side, value.line].filter((item) => item !== undefined).length;
  if (pinCount === 0) {
    return;
  }
  if (pinCount !== 3) {
    errors.push(`${label} line pin needs path, side, and line together`);
  }
  if (value.path !== undefined) {
    const path = requiredString(value.path, `${label}.path`, errors);
    if (path !== undefined) {
      source.path = path;
    }
  }
  if (value.side !== undefined) {
    if (!isSourceSide(value.side)) {
      errors.push(`${label}.side must be old or new`);
    } else {
      source.side = value.side;
    }
  }
  if (value.line !== undefined) {
    const line = requiredInt(value.line, `${label}.line`, errors);
    if (line !== undefined) {
      if (line < 1) {
        errors.push(`${label}.line must be a positive integer`);
      } else {
        source.line = line;
      }
    }
  }
}

function parseKind(value: unknown, label: string, errors: string[]): SourceKind | undefined {
  if (isSourceKind(value)) {
    return value;
  }
  errors.push(`${label} must be one of ${SOURCE_KINDS.join(", ")}`);
  return undefined;
}

function parseLegacyTickets(value: unknown, errors: string[]): Source[] | undefined {
  if (!Array.isArray(value)) {
    errors.push("tickets must be an array");
    return undefined;
  }
  const sources: Source[] = [];
  const ids = new Set<string>();
  value.forEach((item, i) => {
    if (!isRecord(item)) {
      errors.push(`tickets[${i}] must be an object`);
      return;
    }
    extraKeys(item, TICKET_KEYS, `tickets[${i}]`, errors);
    const id = requiredString(item.id, `tickets[${i}].id`, errors);
    if (id === undefined) {
      return;
    }
    if (ids.has(id)) {
      errors.push(`duplicate source id "${id}"`);
    }
    ids.add(id);
    const source: Source = { id, kind: "ticket", label: id };
    if (item.url !== undefined) {
      const url = requiredString(item.url, `tickets[${i}].url`, errors);
      if (url !== undefined) {
        source.url = url;
      }
    }
    if (item.title !== undefined) {
      const title = requiredString(item.title, `tickets[${i}].title`, errors);
      if (title !== undefined) {
        source.title = title;
      }
    }
    if (item.part !== undefined) {
      const part = requiredString(item.part, `tickets[${i}].part`, errors);
      if (part !== undefined) {
        source.part = part;
      }
    }
    sources.push(source);
  });
  return sources;
}

function parseGroups(value: unknown, sources: Source[] | undefined, errors: string[]): ReviewGroup[] {
  if (!Array.isArray(value)) {
    errors.push("groups must be an array");
    return [];
  }
  const ids = new Set<string>();
  const groups: ReviewGroup[] = [];
  value.forEach((item, i) => {
    if (!isRecord(item)) {
      errors.push(`groups[${i}] must be an object`);
      return;
    }
    extraKeys(item, GROUP_KEYS, `groups[${i}]`, errors);
    const id = requiredString(item.id, `groups[${i}].id`, errors);
    const title = requiredString(item.title, `groups[${i}].title`, errors);
    const why = requiredString(item.why, `groups[${i}].why`, errors);
    const summary = requiredString(item.summary, `groups[${i}].summary`, errors, { allowEmpty: true });
    const suggestedOrder = requiredNumber(item.suggestedOrder, `groups[${i}].suggestedOrder`, errors);
    const hunkRefs = parseHunkRefs(item.hunkRefs, `groups[${i}].hunkRefs`, errors);
    const lookFor = parseStringList(item.lookFor, `groups[${i}].lookFor`, errors);
    const dependsOn = parseStringList(item.dependsOn, `groups[${i}].dependsOn`, errors);
    const groupSources = parseStringList(item.sources, `groups[${i}].sources`, errors);
    const part = item.part === undefined ? undefined : requiredString(item.part, `groups[${i}].part`, errors);
    if (id === undefined || title === undefined || why === undefined || summary === undefined || suggestedOrder === undefined) {
      return;
    }
    if (ids.has(id)) {
      errors.push(`duplicate group id "${id}"`);
    }
    ids.add(id);
    const group: ReviewGroup = { id, title, why, summary, suggestedOrder, hunkRefs };
    if (lookFor !== undefined) {
      group.lookFor = lookFor;
    }
    if (dependsOn !== undefined) {
      group.dependsOn = dependsOn;
    }
    if (part !== undefined) {
      group.part = part;
    }
    if (groupSources !== undefined) {
      group.sources = groupSources;
    }
    groups.push(group);
  });
  const knownGroups = new Set(groups.map((group) => group.id));
  const knownSources = new Set((sources ?? []).map((source) => source.id));
  for (const group of groups) {
    for (const dep of group.dependsOn ?? []) {
      if (dep === group.id) {
        errors.push(`groups id "${group.id}" depends on itself`);
      } else if (!knownGroups.has(dep)) {
        errors.push(`groups id "${group.id}" dependsOn unknown group "${dep}"`);
      }
    }
    const seen = new Set<string>();
    for (const sourceId of group.sources ?? []) {
      if (seen.has(sourceId)) {
        errors.push(`groups id "${group.id}" lists source "${sourceId}" twice`);
      }
      seen.add(sourceId);
      if (!knownSources.has(sourceId)) {
        errors.push(`groups id "${group.id}" sources unknown id "${sourceId}"`);
      }
    }
  }
  return groups;
}

function parseHunkRefs(value: unknown, label: string, errors: string[]): HunkRef[] {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
    return [];
  }
  const refs: HunkRef[] = [];
  value.forEach((item, i) => {
    const ref = parseHunkRef(item, `${label}[${i}]`, errors);
    if (ref !== undefined) {
      refs.push(ref);
    }
  });
  return refs;
}

export function parseHunkRef(value: unknown, label: string, errors: string[]): HunkRef | undefined {
  if (!isRecord(value)) {
    errors.push(`${label} must be an object`);
    return undefined;
  }
  extraKeys(value, HUNK_KEYS, label, errors);
  const path = requiredString(value.path, `${label}.path`, errors);
  const oldStart = requiredInt(value.oldStart, `${label}.oldStart`, errors);
  const oldLines = requiredInt(value.oldLines, `${label}.oldLines`, errors);
  const newStart = requiredInt(value.newStart, `${label}.newStart`, errors);
  const newLines = requiredInt(value.newLines, `${label}.newLines`, errors);
  let oldPath: string | undefined;
  if (value.oldPath !== undefined) {
    oldPath = requiredString(value.oldPath, `${label}.oldPath`, errors);
  }
  if (
    path === undefined ||
    oldStart === undefined ||
    oldLines === undefined ||
    newStart === undefined ||
    newLines === undefined
  ) {
    return undefined;
  }
  const ref: HunkRef = { path, oldStart, oldLines, newStart, newLines };
  if (oldPath !== undefined) {
    ref.oldPath = oldPath;
  }
  return ref;
}

function parseStringList(value: unknown, label: string, errors: string[]): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array of strings`);
    return undefined;
  }
  const items: string[] = [];
  value.forEach((item, i) => {
    const text = requiredString(item, `${label}[${i}]`, errors);
    if (text !== undefined) {
      items.push(text);
    }
  });
  return items;
}

function extraKeys(value: Record<string, unknown>, allowed: Set<string>, label: string, errors: string[]): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      errors.push(`${label} has unknown field "${key}" (review documents may not store patch text or file contents)`);
    }
  }
}

function requiredString(
  value: unknown,
  label: string,
  errors: string[],
  opts?: { allowEmpty?: boolean },
): string | undefined {
  if (typeof value !== "string") {
    errors.push(`${label} must be a string`);
    return undefined;
  }
  if (!opts?.allowEmpty && value.trim() === "") {
    errors.push(`${label} must be a non-empty string`);
    return undefined;
  }
  return value;
}

function requiredNumber(value: unknown, label: string, errors: string[]): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${label} must be a finite number`);
    return undefined;
  }
  return value;
}

function requiredInt(value: unknown, label: string, errors: string[]): number | undefined {
  const n = requiredNumber(value, label, errors);
  if (n === undefined) {
    return undefined;
  }
  if (!Number.isInteger(n) || n < 0) {
    errors.push(`${label} must be a non-negative integer`);
    return undefined;
  }
  return n;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
