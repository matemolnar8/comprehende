import type { ElementContent } from "hast";
import { toJsxRuntime, type Components } from "hast-util-to-jsx-runtime";
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { Fragment as JsxFragment, jsx, jsxs } from "react/jsx-runtime";
import { defaultUrlTransform } from "react-markdown";
import type { FileSide } from "../../api/types.ts";
import { fetchFile, resourceHref } from "../api.ts";
import { PierreSnippet, PierreSnippetDiff, SplitResizeHandle } from "../PierreDiff.tsx";
import type { LetteredNote } from "../lib/focus.ts";
import type { GroupFile } from "../lib/group-files.ts";
import {
  cellPins,
  patchChanges,
  patchSpans,
  rowGap,
  rowsInSpans,
  type CellPins,
  type MdCell,
  type MdContainer,
  type MdRow,
} from "../lib/markdown-diff.ts";
import { markdownRowsJob } from "../lib/markdown-rows.ts";
import { setMarkdownView, useMarkdownView } from "../lib/markdown-view.ts";
import { movedMarkLabel, type MovedMark } from "../lib/relocation.ts";
import type { FileComment } from "../lib/source-display.ts";
import { Segmented, SegmentedItem } from "@/components/ui/segmented.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { CommentPin } from "./CommentPin.tsx";
import { HunkGap } from "./FocusBar.tsx";
import { HintWithKey } from "./Kbd.tsx";
import { MovedChip } from "./MovedChip.tsx";
import { NotePin } from "./NotePin.tsx";
import styles from "./MarkdownDiff.module.css";

/**
 * The rows of a Markdown file's hunks, from both sides of the file at their full length: a block
 * parses right only with the lines around it. Undefined while the sides load and the rows are
 * made, null when a side cannot be read.
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
      .then(([before, after]) =>
        markdownRowsJob({ kind: "diff", old: before, new: after, hunks: file.hunks }),
      )
      .catch((cause: unknown) => {
        console.error(cause);
        return null;
      })
      .then((rows) => {
        if (!cancelled) {
          setLoaded({ file, rows });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, file]);
  return loaded?.file === file ? loaded.rows : undefined;
}

/** The rows of one version of a Markdown file. Undefined while they are made. */
export function useMarkdownFileRows(source: string | undefined): MdRow[] | null | undefined {
  const [loaded, setLoaded] = useState<{ source: string; rows: MdRow[] | null }>();
  useEffect(() => {
    if (source === undefined) {
      return;
    }
    let cancelled = false;
    void markdownRowsJob({ kind: "file", source }).then((rows) => {
      if (!cancelled) {
        setLoaded({ source, rows });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [source]);
  return loaded !== undefined && loaded.source === source ? loaded.rows : undefined;
}

/** One choice for every Markdown file. Each copy shows and sets the same shared view. */
export function MarkdownViewControl(props: { size?: "sm" }) {
  const view = useMarkdownView();
  return (
    <Segmented label="Markdown view" size={props.size}>
      <SegmentedItem
        active={view === "rendered"}
        onClick={() => setMarkdownView("rendered")}
        hint={<HintWithKey text="Read the file as rendered Markdown" shortcut="m" />}
      >
        Rendered
      </SegmentedItem>
      <SegmentedItem
        active={view === "source"}
        onClick={() => setMarkdownView("source")}
        hint={<HintWithKey text="Read the file as source lines" shortcut="m" />}
      >
        Source
      </SegmentedItem>
    </Segmented>
  );
}

/** Where a block comes from: a path in it is read from that file, on that side of the change. */
type Origin = { path: string; side: FileSide };

const OriginContext = createContext<Origin | null>(null);

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
  /** The path on the old side, when the change renamed the file. */
  oldPath?: string;
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
    () => patchChanges(patch) && rows.every((row) => row.kind === "context"),
    [patch, rows],
  );
  const twoSided = split && rows.some((row) => row.kind !== "change" || row.old.length > 0);
  const origins = useMemo(
    () => ({
      old: { path: props.oldPath ?? path, side: "old" },
      new: { path, side: "new" },
    }),
    [path, props.oldPath],
  ) satisfies Record<FileSide, Origin>;

  const cell = (item: MdCell, tone: Tone, itemPins = pins.get(item)) => (
    <Cell
      key={`${tone}:${item.unit.index}`}
      cell={item}
      tone={tone}
      wash={!(added && tone === "add")}
      wrap={wrap}
      path={path}
      origin={origins[tone === "del" ? "old" : "new"]}
      pins={itemPins}
      focusCommentId={focusCommentId}
    />
  );
  // A block that shows once takes the pins of both sides.
  const bothPins = (row: Exclude<MdRow, { kind: "change" }>) => {
    const [before, after] = [pins.get(row.old), pins.get(row.new)];
    return before === undefined || after === undefined
      ? (before ?? after)
      : {
          notes: [...before.notes, ...after.notes],
          comments: [...before.comments, ...after.comments],
          moved: before.moved ?? after.moved,
        };
  };
  const columns = (before: ReactNode, after: ReactNode) => (
    <div className="grid [grid-template-columns:minmax(0,var(--md-left))_minmax(0,var(--md-right))]">
      <div className="min-w-0">{before}</div>
      <div className="min-w-0">{after}</div>
    </div>
  );
  const body = (row: MdRow) => {
    if (row.kind === "code") {
      return (
        <Cell
          cell={row.new}
          codeBefore={row.old}
          split={twoSided}
          tone="context"
          wash
          wrap={wrap}
          path={path}
          origin={origins.new}
          pins={bothPins(row)}
          focusCommentId={focusCommentId}
        />
      );
    }
    if (row.kind === "context") {
      return twoSided
        ? columns(cell(row.old, "context"), cell(row.new, "context"))
        : cell(row.new, "context", bothPins(row));
    }
    const before = row.old.map((item) => cell(item, "del"));
    const after = row.new.map((item) => cell(item, "add"));
    return twoSided ? (
      columns(before, after)
    ) : (
      <>
        {before}
        {after}
      </>
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
              "--comprehende-split-left": `${splitRatio}fr`,
              "--comprehende-split-right": `${1 - splitRatio}fr`,
            } as CSSProperties)
          : undefined
      }
    >
      {rows.map((row, i) => {
        const above = rows[i - 1];
        const gap = above === undefined ? undefined : rowGap(above, row);
        // A block that renders as nothing and did not change has nothing to show but a pin.
        const silent =
          row.kind === "context" && row.new.unit.silent === true && bothPins(row) === undefined;
        return (
          <Fragment key={row.kind === "change" ? `r${i}` : `c${row.new.unit.index}`}>
            {gap !== undefined ? (
              <div className="py-2">
                <HunkGap lines={gap} />
              </div>
            ) : null}
            {silent ? null : body(row)}
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

/** One version of a Markdown file, with nothing marked as changed. */
export function MarkdownFile(props: {
  path: string;
  side: FileSide;
  rows: readonly MdRow[];
  wrap: boolean;
}) {
  const origin = useMemo(() => ({ path: props.path, side: props.side }), [props.path, props.side]);
  return (
    <div className="min-w-0 bg-[var(--diff-canvas)] py-3 text-[var(--diff-fg)]">
      {props.rows.map((row) =>
        row.kind === "change" || row.new.unit.silent === true ? null : (
          <Cell
            key={row.new.unit.index}
            cell={row.new}
            tone="context"
            wash
            wrap={props.wrap}
            path={props.path}
            origin={origin}
            pins={undefined}
          />
        ),
      )}
    </div>
  );
}

function Cell(props: {
  cell: MdCell;
  /** The old version of a code block. The cell then shows a line diff of the two. */
  codeBefore?: MdCell;
  split?: boolean;
  tone: Tone;
  wash: boolean;
  wrap: boolean;
  path: string;
  origin: Origin;
  pins: CellPins | undefined;
  focusCommentId?: string;
}) {
  const { cell, tone, pins } = props;
  const code = cell.unit.code !== undefined;
  return (
    <div
      data-md-tone={tone}
      className={cn(
        "flex border-l-[3px] pr-4",
        // The sign sits on the first text line of the block, at any heading size. A code block
        // has no text line of its own, so there the sign sits at the top.
        code ? "items-start" : "items-baseline",
        cell.unit.containers.length > 0 ? "py-0.5" : "py-1.5",
        tone !== "context" && cell.moved ? MOVED_TONE : props.wash ? TONE[tone] : ADDED_FILE_TONE,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "w-7 shrink-0 text-center font-mono text-xs select-none",
          code && "pt-2",
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
        <OriginContext value={props.origin}>
          <Block
            cell={cell}
            codeBefore={props.codeBefore}
            split={props.split === true}
            wrap={props.wrap}
          />
        </OriginContext>
        {pins !== undefined && pins.notes.length > 0 ? <NotePin notes={pins.notes} /> : null}
        {pins !== undefined && pins.comments.length > 0 ? (
          <CommentPin comments={pins.comments} focusId={props.focusCommentId} />
        ) : null}
      </div>
    </div>
  );
}

/** Says why a link or an image does not open, on hover, on focus, and on a click or a tap. */
function Unopened(props: { reason: string; children: ReactElement }) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        asChild
        onClick={(event) => {
          // A click closes a tooltip. Here the click asks for the reason.
          event.preventDefault();
          setOpen(true);
        }}
      >
        {props.children}
      </TooltipTrigger>
      <TooltipContent className="max-w-80">{props.reason}</TooltipContent>
    </Tooltip>
  );
}

function Link(props: { href?: string; children?: ReactNode }) {
  const { href = "" } = props;
  const url = defaultUrlTransform(href);
  if (/^(https?:|mailto:)/i.test(url)) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  }
  return (
    <Unopened
      reason={
        href.startsWith("#")
          ? `This link goes to a heading in this file (${href}). The review does not open it.`
          : `This link goes to ${href} in the repository, not to a web address. The review does not open it.`
      }
    >
      <span data-link tabIndex={0}>
        {props.children}
      </span>
    </Unopened>
  );
}

const REPOSITORY = "https://repository.invalid";

/** A web address for an image, or the path of an image in the repository. */
function imageTarget(src: string, origin: Origin | null): { url: string; path?: string } | null {
  try {
    const from = (origin?.path ?? "").split("/").map(encodeURIComponent).join("/");
    const url = new URL(src, `${REPOSITORY}/${from}`);
    if (url.origin !== REPOSITORY) {
      return /^https?:$/.test(url.protocol) ? { url: url.href } : null;
    }
    if (origin === null) {
      return null;
    }
    const path = decoded(url.pathname.slice(1));
    return { url: resourceHref({ kind: "image", path, side: origin.side }), path };
  } catch {
    return null;
  }
}

/** A file name can hold a bare `%`, which is not an escape. It stays a `%`. */
function decoded(path: string): string {
  try {
    return decodeURIComponent(path.replace(/%(?![0-9a-f]{2})/gi, "%25"));
  } catch {
    return path;
  }
}

function Picture(props: {
  src?: string;
  alt?: string;
  title?: string;
  width?: number | string;
  height?: number | string;
}) {
  const origin = useContext(OriginContext);
  const target = useMemo(
    () => (props.src === undefined ? null : imageTarget(props.src, origin)),
    [origin, props.src],
  );
  // The address that failed, not a flag: another image can take this place in the tree.
  const [failed, setFailed] = useState<string>();
  if (target === null || failed === target.url) {
    return (
      <Unopened
        reason={
          target?.path !== undefined
            ? `The review has no image at ${target.path}. It holds only the images that changed.`
            : `This image did not load: ${props.src ?? "it has no address"}.`
        }
      >
        <span data-image tabIndex={0}>
          {props.alt === undefined || props.alt === "" ? "Image" : props.alt}
        </span>
      </Unopened>
    );
  }
  return (
    <img
      src={target.url}
      alt={props.alt ?? ""}
      title={props.title}
      width={props.width}
      height={props.height}
      loading="lazy"
      onError={() => setFailed(target.url)}
    />
  );
}

const COMPONENTS: Partial<Components> = {
  a: Link,
  img: Picture,
  // A `<picture>` shows its `<img>`, which takes the path above. A `srcset` would not.
  source: () => null,
  // A diff hides nothing: a closed block could hold the change. The blocks after a `<summary>`
  // are rows of their own, so a click on it has nothing to close.
  details: (props) => <details {...props} open />,
  summary: (props) => <summary {...props} onClick={(event) => event.preventDefault()} />,
};

/** One block in its lists and quotes: rendered Markdown or a code block, then its source if set. */
function Block(props: { cell: MdCell; codeBefore?: MdCell; split: boolean; wrap: boolean }) {
  const { cell, codeBefore, wrap } = props;
  const { nodes, source, unit } = cell;
  const content = useMemo(
    () => (unit.code === undefined ? rendered(nodes) : null),
    [nodes, unit.code],
  );
  const lines = useMemo(() => (source === undefined ? null : rendered(source)), [source]);
  const inner =
    unit.code === undefined ? (
      content
    ) : (
      <div className={styles.code}>
        {codeBefore?.unit.code === undefined ? (
          <PierreSnippet code={unit.code} wrap={wrap} />
        ) : (
          <PierreSnippetDiff
            before={codeBefore.unit.code}
            after={unit.code}
            split={props.split}
            wrap={wrap}
          />
        )}
      </div>
    );
  return (
    <div className={styles.prose} data-wrap={wrap ? "" : undefined}>
      {unit.containers.reduceRight<ReactNode>(inContainer, inner)}
      {lines === null ? null : <div data-source>{lines}</div>}
    </div>
  );
}

function rendered(nodes: ElementContent[]): ReactNode {
  return toJsxRuntime(
    { type: "root", children: nodes },
    { Fragment: JsxFragment, jsx, jsxs, components: COMPONENTS },
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
