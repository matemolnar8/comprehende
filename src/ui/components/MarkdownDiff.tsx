import { toJsxRuntime, type Components } from "hast-util-to-jsx-runtime";
import { Fragment, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Fragment as JsxFragment, jsx, jsxs } from "react/jsx-runtime";
import { defaultUrlTransform } from "react-markdown";
import { fetchFile } from "../api.ts";
import { SplitResizeHandle } from "../PierreDiff.tsx";
import type { LetteredNote } from "../lib/focus.ts";
import type { GroupFile } from "../lib/group-files.ts";
import {
  cellPins,
  markdownRows,
  patchChanges,
  patchSpans,
  rowGap,
  rowsInSpans,
  type CellPins,
  type MdCell,
  type MdContainer,
  type MdRow,
} from "../lib/markdown-diff.ts";
import { movedMarkLabel, type MovedMark } from "../lib/relocation.ts";
import type { FileComment } from "../lib/source-display.ts";
import { cn } from "@/lib/utils.ts";
import { CommentPin } from "./CommentPin.tsx";
import { HunkGap } from "./FocusBar.tsx";
import { MovedChip } from "./MovedChip.tsx";
import { NotePin } from "./NotePin.tsx";
import styles from "./MarkdownDiff.module.css";

/**
 * The rows of a Markdown file's hunks, from both sides of the file at their full length: a block
 * parses right only with the lines around it. Undefined while the sides load, null when a side
 * cannot be read.
 */
export function useMarkdownRows(file: GroupFile, active: boolean): MdRow[] | null | undefined {
  const [loaded, setLoaded] = useState<{ file: GroupFile; rows: MdRow[] | null }>();
  useEffect(() => {
    if (!active) {
      return;
    }
    let cancelled = false;
    const side = (name: "old" | "new", missing: GroupFile["status"]) =>
      file.status === missing
        ? Promise.resolve(undefined)
        : fetchFile(file.path, name).then((item) => item.content);
    void Promise.all([side("old", "added"), side("new", "deleted")])
      .then(([before, after]) => {
        if (!cancelled) {
          setLoaded({ file, rows: markdownRows(before, after, file.hunks) });
        }
      })
      .catch((cause: unknown) => {
        console.error(cause);
        if (!cancelled) {
          setLoaded({ file, rows: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, file]);
  return loaded?.file === file ? loaded.rows : undefined;
}

type Tone = "context" | "add" | "del";

const TONE = {
  context: "border-transparent",
  add: "border-[var(--add)] bg-[var(--diff-add-line)] [--md-mark:var(--diff-add-word)]",
  del: "border-[var(--del)] bg-[var(--diff-del-line)] [--md-mark:var(--diff-del-word)]",
} as const satisfies Record<Tone, string>;

/** Moved blocks are not new text. They take the slate wash that moved code lines take. */
const MOVED_TONE =
  "border-[var(--moved)] bg-[color-mix(in_srgb,var(--moved)_14%,var(--diff-canvas))]";

/** A new file keeps the green edge and drops the wash, as its source diff does. */
const ADDED_FILE_TONE = "border-[var(--add)]";

const SIGN = { context: null, add: "+", del: "−" } as const satisfies Record<Tone, string | null>;

/** The hunks of one patch as rendered Markdown: git's lines decide what is red and green. */
export function MarkdownDiff(props: {
  path: string;
  /** Every row of the file. The patch picks the ones this block shows. */
  rows: readonly MdRow[];
  patch: string;
  split: boolean;
  wrap: boolean;
  splitRatio: number;
  onSplitRatio: (ratio: number) => void;
  /** A new file. */
  added: boolean;
  comments?: readonly FileComment[];
  moves?: readonly MovedMark[];
  notes?: readonly LetteredNote[];
  focusCommentId?: string;
}) {
  const { path, patch, split, wrap, splitRatio, added, comments, moves, notes, focusCommentId } =
    props;
  const spans = useMemo(() => patchSpans(patch), [patch]);
  const rows = useMemo(() => rowsInSpans(props.rows, spans), [props.rows, spans]);
  const pins = useMemo(
    () => cellPins(rows, spans, { notes, comments, moves }),
    [comments, moves, notes, rows, spans],
  );
  // Blank lines belong to no block, so a hunk that only changes them has no change row.
  const blankOnly = useMemo(
    () => patchChanges(patch) && !rows.some((row) => row.kind === "change"),
    [patch, rows],
  );
  const twoSided = split && rows.some((row) => row.kind === "context" || row.old.length > 0);

  const cell = (item: MdCell, tone: Tone, itemPins = pins.get(item)) => (
    <Cell
      key={`${tone}:${item.unit.index}`}
      cell={item}
      tone={tone}
      wash={!(added && tone === "add")}
      wrap={wrap}
      path={path}
      pins={itemPins}
      focusCommentId={focusCommentId}
    />
  );
  const sides = (row: MdRow): [ReactNode, ReactNode] =>
    row.kind === "context"
      ? [cell(row.old, "context"), cell(row.new, "context")]
      : [row.old.map((item) => cell(item, "del")), row.new.map((item) => cell(item, "add"))];
  // One column shows a context block once, so it takes the pins of both sides.
  const context = (row: Extract<MdRow, { kind: "context" }>) => {
    const [before, after] = [pins.get(row.old), pins.get(row.new)];
    return cell(
      row.new,
      "context",
      before === undefined || after === undefined
        ? (before ?? after)
        : {
            notes: [...before.notes, ...after.notes],
            comments: [...before.comments, ...after.comments],
            moved: before.moved ?? after.moved,
          },
    );
  };

  return (
    <div
      className="relative min-w-0 bg-[var(--diff-canvas)] py-2 text-[var(--diff-fg)]"
      style={
        twoSided
          ? ({
              "--md-left": `${splitRatio}fr`,
              "--md-right": `${1 - splitRatio}fr`,
            } as CSSProperties)
          : undefined
      }
    >
      {rows.map((row, i) => {
        const above = rows[i - 1];
        const gap = above === undefined ? undefined : rowGap(above, row);
        const [before, after] = sides(row);
        const key = row.kind === "context" ? `c${row.new.unit.index}` : `r${i}`;
        return (
          <Fragment key={key}>
            {gap !== undefined ? (
              <div className="py-2">
                <HunkGap lines={gap} />
              </div>
            ) : null}
            {twoSided ? (
              <div className="grid [grid-template-columns:minmax(0,var(--md-left))_minmax(0,var(--md-right))]">
                <div className="min-w-0">{before}</div>
                <div className="min-w-0">{after}</div>
              </div>
            ) : row.kind === "context" ? (
              context(row)
            ) : (
              <>
                {before}
                {after}
              </>
            )}
          </Fragment>
        );
      })}
      {blankOnly ? (
        <p className="py-1.5 pr-4 pl-[31px] text-xs text-muted-foreground">
          Only blank lines changed.
        </p>
      ) : null}
      {twoSided ? <SplitResizeHandle ratio={splitRatio} onRatio={props.onSplitRatio} /> : null}
    </div>
  );
}

function Cell(props: {
  cell: MdCell;
  tone: Tone;
  wash: boolean;
  wrap: boolean;
  path: string;
  pins: CellPins | undefined;
  focusCommentId?: string;
}) {
  const { cell, tone, pins } = props;
  return (
    <div
      data-md-tone={tone}
      className={cn(
        // The sign sits on the first text line of the block, at any heading size.
        "flex items-baseline border-l-[3px] pr-4",
        cell.unit.containers.length > 0 ? "py-0.5" : "py-1.5",
        tone !== "context" && cell.moved ? MOVED_TONE : props.wash ? TONE[tone] : ADDED_FILE_TONE,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "w-7 shrink-0 text-center font-mono text-xs select-none",
          cell.moved ? "text-[var(--moved)]" : tone === "add" ? "text-add" : "text-del",
        )}
      >
        {SIGN[tone]}
      </span>
      <div className="min-w-0 flex-1">
        {pins?.moved !== undefined ? (
          <div className="pb-1">
            <MovedChip label={movedMarkLabel(props.path, pins.moved)} />
          </div>
        ) : null}
        <Prose cell={cell} wrap={props.wrap} />
        {pins !== undefined && pins.notes.length > 0 ? <NotePin notes={pins.notes} /> : null}
        {pins !== undefined && pins.comments.length > 0 ? (
          <CommentPin comments={pins.comments} focusId={props.focusCommentId} />
        ) : null}
      </div>
    </div>
  );
}

const COMPONENTS: Partial<Components> = {
  // A relative link points into the repository, not into this page. It shows, and does not go.
  a: ({ href, children }) => {
    const url = defaultUrlTransform(href ?? "");
    return /^(https?:|mailto:)/i.test(url) ? (
      <a href={url} target="_blank" rel="noreferrer">
        {children}
      </a>
    ) : (
      <span data-link title={href}>
        {children}
      </span>
    );
  },
  // An image is not fetched: the review reads git, and a remote one would call out.
  img: ({ alt, src }) => (
    <span data-image title={typeof src === "string" ? src : undefined}>
      {alt === undefined || alt === "" ? "Image" : alt}
    </span>
  ),
};

function Prose(props: { cell: MdCell; wrap: boolean }) {
  const { nodes, unit } = props.cell;
  const content = useMemo(
    () =>
      toJsxRuntime(
        { type: "root", children: nodes },
        { Fragment: JsxFragment, jsx, jsxs, components: COMPONENTS },
      ),
    [nodes],
  );
  return (
    <div className={styles.prose} data-wrap={props.wrap ? "" : undefined}>
      {props.cell.raw === true
        ? content
        : unit.containers.reduceRight<ReactNode>(inContainer, content)}
    </div>
  );
}

function inContainer(inner: ReactNode, container: MdContainer): ReactNode {
  if (container.kind === "quote") {
    return <blockquote>{inner}</blockquote>;
  }
  const task = container.checked !== null && container.first;
  const item = (
    <li data-rest={container.first ? undefined : ""} data-task={task ? "" : undefined}>
      {task ? <input type="checkbox" checked={container.checked === true} disabled /> : null}
      {inner}
    </li>
  );
  return container.ordered ? <ol start={container.number}>{item}</ol> : <ul>{item}</ul>;
}
