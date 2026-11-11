import { diff } from "fast-myers-diff";
import type { Element, ElementContent, Nodes } from "hast";
import { raw } from "hast-util-raw";
import { sanitize } from "hast-util-sanitize";
import type { Code, RootContent } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { toHast } from "mdast-util-to-hast";
import { gfm } from "micromark-extension-gfm";
import type { DiffLine } from "../../schema/types.ts";
import type { LetteredNote } from "./focus.ts";
import type { MovedMark } from "./relocation.ts";
import type { FileComment } from "./source-display.ts";

export type MdContainer =
  | {
      kind: "item";
      ordered: boolean;
      number: number;
      checked: boolean | null;
      /** The block that carries the item's bullet. Later blocks of the item only indent. */
      first: boolean;
    }
  | { kind: "quote" };

/** The smallest block that reads alone: a paragraph, a heading, a code block, a table. */
export type MdUnit = {
  /** Place in the file's unit list. */
  index: number;
  /** First and last source line, 1-based. */
  start: number;
  end: number;
  source: string;
  /** The lists and quotes around the block, outermost first. */
  containers: MdContainer[];
  nodes: ElementContent[];
  /** Set on a code block: its text without the fence, and the language the fence names. */
  code?: MdCode;
};

export type MdCode = { lang: string | null; value: string };

/** Splits a Markdown file into units. Lists and quotes are split into the blocks they hold. */
export function markdownUnits(source: string): MdUnit[] {
  const lines = source.split("\n");
  const matterEnd = frontMatterEnd(lines);
  // Blank lines stand in for the front matter, so every line keeps its number.
  const body = lines.map((line, i) => (i < matterEnd ? "" : line)).join("\n");
  const tree = fromMarkdown(body, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const definitions = tree.children.filter((node) => node.type === "definition");
  const units: MdUnit[] = [];
  const push = (node: RootContent, start: number, end: number, containers: MdContainer[]) => {
    const text = lines.slice(start - 1, end).join("\n");
    const rendered = render(node, definitions);
    // A block that renders as nothing shows its source: a link definition, a comment, a lone
    // closing tag. A tag in the diff is never lost.
    const shows = node.type === "html" ? hasContent(rendered) : rendered.length > 0;
    units.push({
      index: units.length,
      start,
      end,
      source: text,
      containers,
      nodes: shows ? rendered : [codeBlock(text)],
      ...(node.type === "code" ? { code: { lang: node.lang ?? null, value: node.value } } : {}),
    });
  };
  if (matterEnd > 0) {
    const yaml: Code = {
      type: "code",
      lang: "yaml",
      value: lines.slice(1, matterEnd - 1).join("\n"),
    };
    push(yaml, 1, matterEnd, []);
  }
  const walk = (nodes: readonly RootContent[], containers: MdContainer[]) => {
    for (const node of nodes) {
      const position = node.position;
      if (position === undefined) {
        continue;
      }
      if (node.type === "blockquote") {
        walk(node.children, [...containers, { kind: "quote" }]);
      } else if (node.type === "list") {
        node.children.forEach((item, i) => {
          const before = units.length;
          const container = (): MdContainer => ({
            kind: "item",
            ordered: node.ordered === true,
            number: (node.start ?? 1) + i,
            checked: item.checked ?? null,
            first: units.length === before,
          });
          for (const child of item.children) {
            walk([child], [...containers, container()]);
          }
          if (units.length === before && item.position !== undefined) {
            push(
              { type: "paragraph", children: [] },
              item.position.start.line,
              item.position.end.line,
              [...containers, container()],
            );
          }
        });
      } else {
        push(node, position.start.line, position.end.line, containers);
      }
    }
  };
  walk(tree.children, []);
  return units;
}

/** Lines of a leading `---` block, or 0. The parser would read its end as a heading rule. */
function frontMatterEnd(lines: readonly string[]): number {
  if (lines[0]?.trimEnd() !== "---") {
    return 0;
  }
  const end = lines.findIndex((line, i) => i > 0 && /^(---|\.\.\.)\s*$/.test(line));
  return end === -1 ? 0 : end + 1;
}

/**
 * The block as HTML nodes. HTML in the Markdown is parsed into the same tree, and the whole tree is
 * then cut down to the tags and attributes GitHub allows: no script, no style, no event handler.
 */
function render(node: RootContent, definitions: readonly RootContent[]): ElementContent[] {
  const hast = toHast(
    // Definitions render as nothing, and let a reference in this block find its target.
    { type: "root", children: [node, ...definitions.filter((item) => item !== node)] },
    { allowDangerousHtml: true },
  );
  const safe = sanitize(hasRaw(hast) ? raw(hast) : hast);
  const children = safe.type === "root" ? safe.children : [safe];
  return children.filter(
    (child): child is ElementContent =>
      child.type === "element" || (child.type === "text" && child.value.trim() !== ""),
  );
}

function hasRaw(node: Nodes): boolean {
  return node.type === "raw" || ("children" in node && node.children.some(hasRaw));
}

/** True when the nodes show text, a picture, or a rule. An empty `<details>` shows nothing. */
function hasContent(nodes: readonly ElementContent[]): boolean {
  return nodes.some((node) =>
    node.type === "text"
      ? node.value.trim() !== ""
      : node.type === "element" &&
        (node.tagName === "img" || node.tagName === "hr" || hasContent(node.children)),
  );
}

function codeBlock(value: string): Element {
  return {
    type: "element",
    tagName: "pre",
    properties: {},
    children: [
      { type: "element", tagName: "code", properties: {}, children: [{ type: "text", value }] },
    ],
  };
}

type Side = "old" | "new";

type Span = { from: number; to: number };

/** One run of changed lines: the old lines it removes and the new lines it adds, end exclusive. */
type Region = { old: Span; new: Span };

export type HunkLines = {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: readonly DiffLine[];
};

function changeRegions(hunks: readonly HunkLines[]): Region[] {
  const regions: Region[] = [];
  for (const hunk of hunks) {
    // An empty side names the line before it, as git writes it.
    let old = hunk.oldLines === 0 ? hunk.oldStart + 1 : hunk.oldStart;
    let next = hunk.newLines === 0 ? hunk.newStart + 1 : hunk.newStart;
    let open: Region | undefined;
    for (const line of hunk.lines) {
      if (line.kind === "ctx") {
        open = undefined;
        old += 1;
        next += 1;
        continue;
      }
      if (open === undefined) {
        open = { old: { from: old, to: old }, new: { from: next, to: next } };
        regions.push(open);
      }
      if (line.kind === "del") {
        old += 1;
        open.old.to = old;
      } else {
        next += 1;
        open.new.to = next;
      }
    }
  }
  return regions;
}

/**
 * Where an old line sits on the new side. A removed line covers the lines that replace it. With
 * no replacement it sits between two new lines, at a half step, so it is inside a block only when
 * that block has lines on both sides of it.
 */
function oldLineOnNew(regions: readonly Region[], line: number): Span {
  let shift: number | undefined;
  for (const region of regions) {
    if (line >= region.old.from && line < region.old.to) {
      return region.new.to > region.new.from
        ? { from: region.new.from, to: region.new.to - 1 }
        : { from: region.new.from - 0.5, to: region.new.from - 0.5 };
    }
    if (region.old.to <= line) {
      shift = region.new.to - region.old.to;
    } else {
      shift ??= region.new.from - region.old.from;
      break;
    }
  }
  return { from: line + (shift ?? 0), to: line + (shift ?? 0) };
}

/** A character range of a unit's text that differs from the other side. */
export type Mark = { from: number; to: number };

export type MdCell = {
  unit: MdUnit;
  nodes: ElementContent[];
  /** Git found every line of the block on the other side of a move. */
  moved: boolean;
  /** The nodes are the block's source lines, which hold its list marks and quote marks. */
  raw?: true;
};

export type MdRow =
  | { kind: "context"; old: MdCell; new: MdCell }
  /** One code block with lines that changed. It reads as a line diff of the two blocks. */
  | { kind: "code"; old: MdCell; new: MdCell }
  | { kind: "change"; old: MdCell[]; new: MdCell[] };

function cellsOf(row: MdRow, side: Side): readonly MdCell[] {
  return row.kind === "change" ? row[side] : [row[side]];
}

/** Every block of one version of a file, top to bottom. Nothing in it is a change. */
export function markdownFileRows(source: string): MdRow[] {
  return markdownUnits(source).map((unit) => {
    const cell = { unit, nodes: unit.nodes, moved: false };
    return { kind: "context", old: cell, new: cell };
  });
}

/**
 * The blocks the hunks touch, top to bottom. Git's lines decide what changed: blocks that share a
 * changed line, or lines of one another, are one change row with the old blocks and the new
 * blocks. A block with the same lines on both sides is context.
 */
export function markdownRows(
  oldSource: string | undefined,
  newSource: string | undefined,
  hunks: readonly HunkLines[],
): MdRow[] {
  const regions = changeRegions(hunks);
  const inHunk = (side: Side) => (unit: MdUnit) =>
    hunks.some((hunk) => {
      const start = side === "old" ? hunk.oldStart : hunk.newStart;
      const count = side === "old" ? hunk.oldLines : hunk.newLines;
      return count > 0 && unit.start < start + count && unit.end >= start;
    });
  const oldUnits = oldSource === undefined ? [] : markdownUnits(oldSource).filter(inHunk("old"));
  const newUnits = newSource === undefined ? [] : markdownUnits(newSource).filter(inHunk("new"));
  const moved = movedLines(hunks);

  const items = [
    ...oldUnits.map((unit) => ({
      side: "old" as const,
      unit,
      from: oldLineOnNew(regions, unit.start).from,
      to: oldLineOnNew(regions, unit.end).to,
    })),
    ...newUnits.map((unit) => ({ side: "new" as const, unit, from: unit.start, to: unit.end })),
  ].sort((a, b) => a.from - b.from || a.unit.index - b.unit.index);

  const rows: MdRow[] = [];
  let cluster: typeof items = [];
  let reach = -Infinity;
  const flush = () => {
    const olds = cluster.filter((item) => item.side === "old").map((item) => item.unit);
    const news = cluster.filter((item) => item.side === "new").map((item) => item.unit);
    const [before, after] = [olds[0], news[0]];
    if (
      olds.length === 1 &&
      news.length === 1 &&
      before !== undefined &&
      after !== undefined &&
      before.source === after.source
    ) {
      rows.push({
        kind: "context",
        old: { unit: before, nodes: before.nodes, moved: false },
        new: { unit: after, nodes: after.nodes, moved: false },
      });
    } else if (cluster.length > 0) {
      rows.push(changeRow(olds, news, moved));
    }
    cluster = [];
  };
  for (const item of items) {
    if (item.from > reach) {
      flush();
    }
    cluster.push(item);
    reach = Math.max(reach, item.to);
  }
  flush();
  return rows;
}

function movedLines(hunks: readonly HunkLines[]): { old: Set<number>; new: Set<number> } {
  const moved = { old: new Set<number>(), new: new Set<number>() };
  for (const line of hunks.flatMap((hunk) => hunk.lines)) {
    if (line.moved === undefined) {
      continue;
    }
    if (line.kind === "del" && line.oldNumber !== null) {
      moved.old.add(line.oldNumber);
    } else if (line.kind === "add" && line.newNumber !== null) {
      moved.new.add(line.newNumber);
    }
  }
  return moved;
}

function changeRow(
  olds: readonly MdUnit[],
  news: readonly MdUnit[],
  moved: { old: ReadonlySet<number>; new: ReadonlySet<number> },
): MdRow {
  const isMoved = (unit: MdUnit, lines: ReadonlySet<number>) =>
    unit.source.split("\n").every((text, i) => text.trim() === "" || lines.has(unit.start + i));
  const oldMoved = olds.map((unit) => isMoved(unit, moved.old));
  const newMoved = news.map((unit) => isMoved(unit, moved.new));
  // A moved block did not change, so it takes no part in the word diff.
  const live = (units: readonly MdUnit[], flags: readonly boolean[]) =>
    units.filter((_, i) => flags[i] !== true);
  const liveOld = live(olds, oldMoved);
  const liveNew = live(news, newMoved);
  const [before, after] = [olds[0], news[0]];
  if (
    olds.length === 1 &&
    news.length === 1 &&
    liveOld.length === 1 &&
    liveNew.length === 1 &&
    before?.code !== undefined &&
    after?.code !== undefined &&
    before.code.value !== after.code.value
  ) {
    return {
      kind: "code",
      old: { unit: before, nodes: before.nodes, moved: false },
      new: { unit: after, nodes: after.nodes, moved: false },
    };
  }
  // Only markup changed, such as a link target or an image path. The rendered blocks would look
  // the same, so the row shows its source, with the markup that differs marked.
  const source =
    liveOld.length > 0 &&
    liveNew.length > 0 &&
    sameWords(
      liveOld.map((unit) => nodesText(unit.nodes)),
      liveNew.map((unit) => nodesText(unit.nodes)),
    );
  // A code block reads as code, with no word marks: its lines are added or removed whole.
  const text = (unit: MdUnit) =>
    source ? unit.source : unit.code === undefined ? nodesText(unit.nodes) : "";
  const marks = wordMarks(
    olds.map((unit, i) => (oldMoved[i] === true ? "" : text(unit))),
    news.map((unit, i) => (newMoved[i] === true ? "" : text(unit))),
  );
  const cells = (units: readonly MdUnit[], flags: readonly boolean[], side: Mark[][]): MdCell[] =>
    units.map((unit, i) => {
      if (flags[i] === true) {
        return { unit, nodes: unit.nodes, moved: true };
      }
      return source
        ? {
            unit,
            nodes: markNodes([codeBlock(unit.source)], side[i] ?? []),
            moved: false,
            raw: true,
          }
        : { unit, nodes: markNodes(unit.nodes, side[i] ?? []), moved: false };
    });
  return {
    kind: "change",
    old: cells(olds, oldMoved, marks.old),
    new: cells(news, newMoved, marks.new),
  };
}

function nodesText(nodes: readonly ElementContent[]): string {
  return nodes
    .map((node) =>
      node.type === "text" ? node.value : node.type === "element" ? nodesText(node.children) : "",
    )
    .join("");
}

type Token = { text: string; unit: number; from: number; to: number };

function tokens(texts: readonly string[]): Token[] {
  return texts.flatMap((text, unit) =>
    [...text.matchAll(/[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu)].map((match) => ({
      text: match[0],
      unit,
      from: match.index,
      to: match.index + match[0].length,
    })),
  );
}

/** True when both sides read as the same words in the same order. */
function sameWords(oldTexts: readonly string[], newTexts: readonly string[]): boolean {
  const words = (texts: readonly string[]) =>
    tokens(texts)
      .map((token) => token.text)
      .join("\n");
  return words(oldTexts) === words(newTexts);
}

type Edit = { sx: number; ex: number; sy: number; ey: number };

/**
 * Word-level marks for the blocks of one change row. The old blocks are compared with the new
 * blocks as one text, so a block has no fixed partner.
 */
export function wordMarks(
  oldTexts: readonly string[],
  newTexts: readonly string[],
): { old: Mark[][]; new: Mark[][] } {
  const oldTokens = tokens(oldTexts);
  const newTokens = tokens(newTexts);
  const ids = new Map<string, number>();
  const id = (token: Token) => {
    const known = ids.get(token.text);
    if (known !== undefined) {
      return known;
    }
    ids.set(token.text, ids.size);
    return ids.size - 1;
  };
  const edits = joinEdits(
    diff(Int32Array.from(oldTokens, id), Int32Array.from(newTokens, id)),
    textSizes(oldTokens),
    textSizes(newTokens),
  );
  const oldChanged = new Uint8Array(oldTokens.length);
  const newChanged = new Uint8Array(newTokens.length);
  for (const edit of edits) {
    oldChanged.fill(1, edit.sx, edit.ex);
    newChanged.fill(1, edit.sy, edit.ey);
  }
  return {
    old: unitMarks(oldTokens, oldChanged, oldTexts.length),
    new: unitMarks(newTokens, newChanged, newTexts.length),
  };
}

function isWord(token: Token): boolean {
  return /^[\p{L}\p{N}_]/u.test(token.text);
}

/**
 * The size of a run of tokens: the letters of its words. A comma or a bracket has no size, so a
 * match of punctuation alone does not count as kept text.
 */
function textSizes(all: readonly Token[]): (from: number, to: number) => number {
  const before = new Uint32Array(all.length + 1);
  all.forEach((token, i) => {
    before[i + 1] = (before[i] ?? 0) + (isWord(token) ? token.text.length : 0);
  });
  return (from, to) => (before[to] ?? 0) - (before[from] ?? 0);
}

/**
 * Joins two changes when the text kept between them is no longer than either change. Text that
 * short is most often a chance match inside a rewrite, such as "the" or a comma, and marks that
 * stop for it read as noise. This is the semantic cleanup of diff-match-patch.
 */
function joinEdits(
  edits: Iterable<readonly [number, number, number, number]>,
  oldSize: (from: number, to: number) => number,
  newSize: (from: number, to: number) => number,
): Edit[] {
  const size = (edit: Edit) => Math.max(oldSize(edit.sx, edit.ex), newSize(edit.sy, edit.ey));
  const joined: Edit[] = [];
  for (const [sx, ex, sy, ey] of edits) {
    let edit: Edit = { sx, ex, sy, ey };
    for (let last = joined.at(-1); last !== undefined; last = joined.at(-1)) {
      const kept = oldSize(last.ex, edit.sx);
      if (kept > size(last) || kept > size(edit)) {
        break;
      }
      edit = { sx: last.sx, ex: edit.ex, sy: last.sy, ey: edit.ey };
      joined.pop();
    }
    joined.push(edit);
  }
  return joined;
}

function unitMarks(all: readonly Token[], changed: Uint8Array, units: number): Mark[][] {
  return Array.from({ length: units }, (_, unit) => {
    const mine = all.flatMap((token, i) =>
      token.unit === unit ? [{ token, changed: changed[i] === 1 }] : [],
    );
    // A block with no word kept is new text. The tint on the block says so, and marks add nothing.
    const words = mine.filter((item) => isWord(item.token));
    if ((words.length > 0 ? words : mine).every((item) => item.changed)) {
      return [];
    }
    const marks: (Mark & { last: number })[] = [];
    mine.forEach((item, i) => {
      if (!item.changed) {
        return;
      }
      const open = marks.at(-1);
      if (open !== undefined && open.last === i - 1) {
        open.to = item.token.to;
        open.last = i;
      } else {
        marks.push({ from: item.token.from, to: item.token.to, last: i });
      }
    });
    return marks.map(({ from, to }) => ({ from, to }));
  });
}

/** Wraps the marked ranges of the nodes' text in `<mark>`. Offsets count text nodes in order. */
export function markNodes(nodes: ElementContent[], marks: readonly Mark[]): ElementContent[] {
  if (marks.length === 0) {
    return nodes;
  }
  let offset = 0;
  const visit = (list: readonly ElementContent[]): ElementContent[] =>
    list.flatMap((node): ElementContent[] => {
      if (node.type === "element") {
        return [{ ...node, children: visit(node.children) }];
      }
      if (node.type !== "text") {
        return [node];
      }
      const start = offset;
      offset += node.value.length;
      // White space between table cells is not text: a mark there would break the table.
      if (node.value.trim() === "") {
        return [node];
      }
      const out: ElementContent[] = [];
      let at = 0;
      for (const mark of marks) {
        const from = Math.max(0, mark.from - start);
        const to = Math.min(node.value.length, mark.to - start);
        if (to <= from) {
          continue;
        }
        if (from > at) {
          out.push({ type: "text", value: node.value.slice(at, from) });
        }
        out.push({
          type: "element",
          tagName: "mark",
          properties: {},
          children: [{ type: "text", value: node.value.slice(from, to) }],
        });
        at = to;
      }
      if (at < node.value.length) {
        out.push({ type: "text", value: node.value.slice(at) });
      }
      return out;
    });
  return visit(nodes);
}

const HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

/** The old and new lines of each hunk of a patch, end exclusive. */
export function patchSpans(patch: string): Region[] {
  return patch.split("\n").flatMap((line) => {
    const match = HEADER.exec(line);
    if (match === null) {
      return [];
    }
    const span = (start: string | undefined, count: string | undefined): Span => {
      const from = Number(start);
      return { from, to: from + (count === undefined ? 1 : Number(count)) };
    };
    return [{ old: span(match[1], match[2]), new: span(match[3], match[4]) }];
  });
}

/** The rows with a block on a line of one of the spans. */
export function rowsInSpans(rows: readonly MdRow[], spans: readonly Region[]): MdRow[] {
  const hit = (row: MdRow, side: Side) =>
    cellsOf(row, side).some((cell) =>
      spans.some((span) => cell.unit.start < span[side].to && cell.unit.end >= span[side].from),
    );
  return rows.filter((row) => hit(row, "old") || hit(row, "new"));
}

export type CellPins = { notes: LetteredNote[]; comments: FileComment[]; moved?: MovedMark };

/**
 * What hangs on each block: the notes and comments pinned to its lines, and the mark of a move
 * that starts in it. A pin on a line between two blocks hangs on the block above it. A pin on a
 * line outside the spans belongs to another part of the file.
 */
export function cellPins(
  rows: readonly MdRow[],
  spans: readonly Region[],
  pinned: {
    notes?: readonly LetteredNote[];
    comments?: readonly FileComment[];
    moves?: readonly MovedMark[];
  },
): Map<MdCell, CellPins> {
  const cells = {
    old: rows.flatMap((row) => cellsOf(row, "old")),
    new: rows.flatMap((row) => cellsOf(row, "new")),
  };
  const pins = new Map<MdCell, CellPins>();
  const inSpans = (side: Side, line: number) =>
    spans.some((span) => line >= span[side].from && line < span[side].to);
  const entry = (cell: MdCell | undefined): CellPins | undefined => {
    if (cell === undefined) {
      return undefined;
    }
    const found = pins.get(cell) ?? { notes: [], comments: [] };
    pins.set(cell, found);
    return found;
  };
  const at = (side: Side, line: number) =>
    inSpans(side, line)
      ? entry(cells[side].findLast((item) => item.unit.start <= line) ?? cells[side][0])
      : undefined;
  for (const note of pinned.notes ?? []) {
    at(note.side, note.line)?.notes.push(note);
  }
  for (const comment of pinned.comments ?? []) {
    at(comment.side, comment.line)?.comments.push(comment);
  }
  for (const mark of pinned.moves ?? []) {
    // A move can start on a blank line. Its mark goes on the first block of the move.
    const first = inSpans(mark.side, mark.line)
      ? entry(
          cells[mark.side].find(
            (item) => item.unit.end >= mark.line && item.unit.start <= mark.end,
          ),
        )
      : undefined;
    if (first !== undefined) {
      first.moved ??= mark;
    }
  }
  return pins;
}

/** True when the patch adds or removes a line. An excerpt of a hunk can hold only context. */
export function patchChanges(patch: string): boolean {
  const body = patch.slice(Math.max(0, patch.search(/^@@ /m)));
  return /^[+-]/m.test(body);
}

/** New-side lines between two rows that are not next to each other in the file. */
export function rowGap(above: MdRow, below: MdRow): Span | undefined {
  const last = cellsOf(above, "new").at(-1);
  const first = cellsOf(below, "new")[0];
  if (last === undefined || first === undefined || first.unit.index - last.unit.index <= 1) {
    return undefined;
  }
  return { from: last.unit.end + 1, to: first.unit.start - 1 };
}
