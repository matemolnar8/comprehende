import { createHash } from "node:crypto";
import type { LineNote, ReviewDocument, ReviewGroup } from "../../src/schema/types.ts";
import { isDirHunkRef, refCoversPath } from "../../src/schema/identity.ts";

export const DUEL_KINDS = [
  "summary",
  "why",
  "lookFor",
  "grouping",
  "group",
  "fileNote",
  "lineNote",
] as const;

export type Side = { label: string; document: ReviewDocument };

type Entry = { label: string; title?: string; text: string };

export type DuelCard = {
  id: string;
  case: string;
  kind: (typeof DUEL_KINDS)[number];
  question: string;
  context: string;
  x: Entry;
  y: Entry;
  /** Set on a lineNote card. The caller reads these lines at head. */
  anchor?: { path: string; line: number };
};

const QUESTIONS: Record<DuelCard["kind"], string> = {
  summary: "Which one-line summary is better?",
  why: "Which “why” would you want to read?",
  lookFor: "Which list of warnings is better?",
  grouping: "Which grouping do you want to review?",
  group: "Which group card helps you more?",
  fileNote: "Which file note is better?",
  lineNote: "Which line note is better?",
};

const GROUP_MATCH_MIN = 0.5;
const NOTE_LINE_REACH = 1;
/** A review of many files writes many notes. A few of each kind is enough to judge. */
const PER_KIND_MAX = 3;
const GROUPING_PATHS_SHOWN = 4;

/** One card per piece both reviews wrote about the same thing with different words. */
export function duelCards(caseId: string, x: Side, y: Side): DuelCard[] {
  const cards: DuelCard[] = [];
  const add = (
    kind: DuelCard["kind"],
    context: string,
    left: Omit<Entry, "label"> | undefined,
    right: Omit<Entry, "label"> | undefined,
    anchor?: DuelCard["anchor"],
    /** Tells apart two pairs that hold the same words. */
    place = "",
  ) => {
    if (left === undefined || right === undefined) {
      return;
    }
    if (left.text === right.text && left.title === right.title) {
      return;
    }
    const hash = createHash("sha1")
      .update(
        [x.label, y.label, context, place, left.title, left.text, right.title, right.text].join(
          "\0",
        ),
      )
      .digest("hex")
      .slice(0, 10);
    cards.push({
      id: `${caseId}.${kind}.${hash}`,
      case: caseId,
      kind,
      question: QUESTIONS[kind],
      context,
      x: { label: x.label, ...left },
      y: { label: y.label, ...right },
      ...(anchor === undefined ? {} : { anchor }),
    });
  };
  const text = (value: string | undefined) => (value === undefined ? undefined : { text: value });
  const doc = `${caseId} · ${x.document.title}`;

  add("summary", doc, text(x.document.summary), text(y.document.summary));
  add("why", doc, text(x.document.why), text(y.document.why));
  add("lookFor", doc, text(bullets(x.document.lookFor)), text(bullets(y.document.lookFor)));
  if (partition(x.document) !== partition(y.document)) {
    add("grouping", doc, text(groupingText(x.document)), text(groupingText(y.document)));
  }

  for (const [left, right] of matchGroups(x.document.groups, y.document.groups)) {
    add("group", doc, groupEntry(left), groupEntry(right));
  }

  const rightFileNotes = fileNotes(y.document);
  for (const [path, note] of fileNotes(x.document)) {
    add("fileNote", `${caseId} · ${path}`, text(note), text(rightFileNotes.get(path)));
  }

  const freeNotes = new Set(lineNotes(y.document));
  for (const note of lineNotes(x.document)) {
    const distance = (other: LineNote) => Math.abs(other.line - note.line);
    const near = [...freeNotes]
      .filter((other) => other.path === note.path && distance(other) <= NOTE_LINE_REACH)
      .toSorted((a, b) => distance(a) - distance(b))[0];
    if (near === undefined) {
      continue;
    }
    freeNotes.delete(near);
    add(
      "lineNote",
      `${caseId} · ${note.path}`,
      text(note.body),
      text(near.body),
      { path: note.path, line: note.line },
      `${note.line}:${near.line}`,
    );
  }
  return capPerKind(cards);
}

/** Picks the kept cards in hash order, so the pick does not favor the first paths in the alphabet. */
function capPerKind(cards: DuelCard[]): DuelCard[] {
  const hash = (card: DuelCard) => card.id.slice(card.id.lastIndexOf(".") + 1);
  const kept = new Map<DuelCard["kind"], DuelCard[]>();
  for (const card of cards.toSorted((a, b) => hash(a).localeCompare(hash(b)))) {
    const list = kept.get(card.kind) ?? [];
    if (list.length < PER_KIND_MAX) {
      kept.set(card.kind, [...list, card]);
    }
  }
  return cards.filter((card) => kept.get(card.kind)?.includes(card));
}

function bullets(items: readonly string[] | undefined): string | undefined {
  return items === undefined || items.length === 0
    ? undefined
    : items.map((item) => `• ${item}`).join("\n");
}

function groupPaths(group: ReviewGroup): string[] {
  return [...new Set(group.hunkRefs.map((ref) => (isDirHunkRef(ref) ? ref.dir : ref.path)))].sort();
}

function partition(document: ReviewDocument): string {
  return document.groups
    .map((group) => groupPaths(group).join(","))
    .sort()
    .join("|");
}

function groupingText(document: ReviewDocument): string {
  const lines = document.groups.map((group) => {
    const paths = groupPaths(group).map((path) =>
      path.slice(path.lastIndexOf("/", path.length - 2) + 1),
    );
    const shown = paths.slice(0, GROUPING_PATHS_SHOWN).join(", ");
    const rest = paths.length - GROUPING_PATHS_SHOWN;
    return `• ${group.title}: ${shown}${rest > 0 ? ` and ${rest} more` : ""}`;
  });
  const count = document.groups.length;
  return [`${count} ${count === 1 ? "group" : "groups"}`, ...lines].join("\n");
}

/** Pairs each left group with the unused right group that shares the most files. */
function matchGroups(
  left: readonly ReviewGroup[],
  right: readonly ReviewGroup[],
): [ReviewGroup, ReviewGroup][] {
  const free = new Set(right);
  const pairs: [ReviewGroup, ReviewGroup][] = [];
  for (const group of left) {
    let best: { group: ReviewGroup; score: number } | undefined;
    for (const candidate of free) {
      const score = overlap(group, candidate);
      if (score >= GROUP_MATCH_MIN && score > (best?.score ?? 0)) {
        best = { group: candidate, score };
      }
    }
    if (best !== undefined) {
      free.delete(best.group);
      pairs.push([group, best.group]);
    }
  }
  return pairs;
}

/** The share of both groups' paths that the other group covers. A directory ref covers the files under it. */
function overlap(a: ReviewGroup, b: ReviewGroup): number {
  const covered = (from: ReviewGroup, by: ReviewGroup) =>
    groupPaths(from).filter((path) => by.hunkRefs.some((ref) => refCoversPath(ref, path))).length;
  return (covered(a, b) + covered(b, a)) / (groupPaths(a).length + groupPaths(b).length);
}

function groupEntry(group: ReviewGroup): Omit<Entry, "label"> {
  const lines = [
    group.why === undefined ? [] : [`Why: ${group.why}`],
    [group.summary],
    group.attention === undefined ? [] : [`Attention: ${group.attention.note}`],
    (group.questions ?? []).map((question) => `Question: ${question}`),
  ];
  return { title: group.title, text: lines.flat().join("\n") };
}

function fileNotes(document: ReviewDocument): Map<string, string> {
  const notes = new Map<string, string>();
  for (const group of document.groups) {
    for (const [path, note] of Object.entries(group.fileNotes ?? {})) {
      if (!notes.has(path)) {
        notes.set(path, note);
      }
    }
  }
  return notes;
}

/** Notes on the new side only, because the card shows the file at head. */
function lineNotes(document: ReviewDocument): LineNote[] {
  return document.groups.flatMap((group) =>
    (group.notes ?? []).filter((note) => note.side !== "old"),
  );
}
