import {
  EXTENSION_TO_FILE_FORMAT,
  hydratePartialDiff,
  parseDiffFromFile,
  parsePatchFiles,
  registerCustomTheme,
  resolveTheme,
  type DiffLineAnnotation,
  type FileDiffLoadedFiles,
  type FileDiffMetadata,
  type LineAnnotation,
} from "@pierre/diffs";
import { File, FileDiff, WorkerPoolContextProvider } from "@pierre/diffs/react";
import DiffsWorker from "@pierre/diffs/worker/worker.js?worker";
import { GripVerticalIcon } from "lucide-react";
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { fenceLanguage } from "../api/markdown.ts";
import { fetchFile, shortSha } from "./api.ts";
import { EXPANSION_LINE_COUNT, GAP_CSS, GAP_SEPARATOR } from "@/lib/gap-style.ts";
import { canHydrateDiff, loadDiffFilesWith, splitHasTwoSides } from "@/lib/load-diff-files.ts";
import {
  gapSeparator,
  isPlainDownClick,
  reviewScroller,
  watchGapPin,
  type GapPin,
} from "@/lib/pin-gap-expand.ts";
import { SYNTAX_RECOLORS, recolorTheme } from "@/lib/syntax-theme.ts";
import { DIFF_THEMES } from "@/lib/theme.ts";
import { useTheme } from "@/lib/ThemeProvider.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { CommentPin } from "./components/CommentPin.tsx";
import { MovedChip } from "./components/MovedChip.tsx";
import { NotePin } from "./components/NotePin.tsx";
import type { LetteredNote } from "./lib/focus.ts";
import { movedMarkLabel, type MovedLabel, type MovedMark } from "./lib/relocation.ts";
import type { FileComment } from "./lib/source-display.ts";
import { commentsByLine } from "./lib/source-display.ts";

for (const mode of ["light", "dark"] as const) {
  const recolor = SYNTAX_RECOLORS[mode];
  registerCustomTheme(DIFF_THEMES[mode], async () =>
    recolorTheme(await resolveTheme(recolor.base), DIFF_THEMES[mode], recolor),
  );
}

/** GitHub Primer diffblob colors, mapped into Pierre's shadow tree. */
const PIERRE_UNSAFE_CSS = `
[data-diffs-header],
[data-diff],
[data-file],
[data-error-wrapper],
[data-virtualizer-buffer] {
  --diffs-header-font-family: var(--font-sans) !important;
  --diffs-font-family: var(--font-mono) !important;
  --diffs-font-size: var(--diff-font-size) !important;
  --diffs-line-height: var(--diff-line-height) !important;
  --diffs-bg: var(--diff-canvas) !important;
  --diffs-light-bg: var(--diff-canvas) !important;
  --diffs-dark-bg: var(--diff-canvas) !important;
  --diffs-token-light-bg: transparent;
  --diffs-token-dark-bg: transparent;
  --diffs-bg-context-override: var(--diff-canvas);
  --diffs-bg-hover-override: var(--diff-hover);
  --diffs-bg-separator-override: var(--diff-hunk);
  --diffs-bg-buffer-override: var(--diff-hunk);
  --diffs-bg-addition-override: var(--diff-add-line);
  --diffs-bg-addition-number-override: var(--diff-add-num);
  --diffs-bg-addition-hover-override: var(--diff-add-line);
  --diffs-bg-addition-emphasis-override: var(--diff-add-word);
  --diffs-bg-deletion-override: var(--diff-del-line);
  --diffs-bg-deletion-number-override: var(--diff-del-num);
  --diffs-bg-deletion-hover-override: var(--diff-del-line);
  --diffs-bg-deletion-emphasis-override: var(--diff-del-word);
  background-color: var(--diff-canvas) !important;
  color: var(--diff-fg) !important;
}

[data-line-type="change-addition"] {
  background-color: var(--diff-add-line) !important;
}
[data-line-type="change-addition"][data-column-number] {
  background-color: var(--diff-add-num) !important;
}
[data-line-type="change-deletion"] {
  background-color: var(--diff-del-line) !important;
}
[data-line-type="change-deletion"][data-column-number] {
  background-color: var(--diff-del-num) !important;
}

/* Pins sit on the canvas; the gutter beside them must not read as a grey slab. */
[data-gutter-buffer="annotation"],
[data-line-annotation] {
  background-color: var(--diff-canvas) !important;
}

[data-overflow="scroll"] [data-code] {
  mask-image: linear-gradient(to right, black calc(100% - 1.5rem), transparent);
}
[data-overflow="scroll"] [data-line] {
  padding-inline-end: calc(1ch + 1.5rem) !important;
}

[data-diff-type="split"][data-overflow="scroll"] {
  grid-template-columns: minmax(0, var(--comprehende-split-left, 1fr)) minmax(0, var(--comprehende-split-right, 1fr)) !important;
}

@media (max-width: 799px) {
  [data-column-number] {
    padding-left: 1ch !important;
  }
  [data-line],
  [data-column-number],
  [data-no-newline] {
    padding-inline: 0.5ch !important;
  }
  [data-gutter-buffer] {
    padding-left: 1ch !important;
    padding-right: 0.5ch !important;
  }
}

[data-diff-type="split"][data-overflow="wrap"],
[data-dehydrated][data-diff-type="split"][data-overflow="scroll"] {
  grid-template-columns:
    var(--diffs-grid-number-column-width)
    minmax(0, var(--comprehende-split-left, 1fr))
    var(--diffs-grid-number-column-width)
    minmax(0, var(--comprehende-split-right, 1fr)) !important;
}
`;

/**
 * A blame stamp spans the code column only. Its gutter cell gets the same fill and top line and no
 * gap seam, so each stamp row is one band from the card edge, like the stamp over the file.
 */
const BLAME_CSS = `
[data-gutter-buffer="annotation"] {
  background-color: color-mix(in srgb, var(--muted) 50%, var(--diff-canvas)) !important;
  border-right: 0 !important;
  box-shadow: inset 0 1px 0 var(--border);
}
`;

/**
 * A line whose commit is in the reviewed range gets a primary gutter bar: "touched in this review", not "added".
 * The bar starts on the gutter cell of the run's stamp, so it is one line down the card edge.
 */
export function blameGutterCss(runs: readonly FileAnnotation["metadata"][]): string {
  const inRange = runs.filter((run) => run.inRange);
  const cells = inRange
    .flatMap((run) => Array.from({ length: run.lines }, (_, i) => run.start + i))
    .map((line) => `[data-column-number="${line}"]`);
  if (cells.length === 0) return "";
  const stamps = inRange
    .filter((run) => run.start > 1)
    .map((run) => `[data-column-number="${run.start - 1}"] + [data-gutter-buffer="annotation"]`);
  const lineRule = `:is(${cells.join(",")}) {
  box-shadow: inset 2px 0 0 var(--primary);
}`;
  if (stamps.length === 0) return lineRule;
  return `${lineRule}
:is(${stamps.join(",")}) {
  box-shadow: inset 2px 0 0 var(--primary), inset 0 1px 0 var(--border);
}`;
}

const MIN_SPLIT = 0.2;
const MAX_SPLIT = 0.8;

export function clampSplitRatio(ratio: number): number {
  return Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, ratio));
}

export function PierreDiffPool(props: { children: ReactNode }) {
  const poolOptions = useMemo(() => {
    const cores =
      typeof navigator === "undefined" ? 4 : Math.max(1, navigator.hardwareConcurrency || 4);
    return {
      workerFactory: () => new DiffsWorker(),
      poolSize: Math.max(2, Math.min(6, Math.floor(cores / 2))),
    };
  }, []);
  const highlighterOptions = useMemo(
    () => ({
      theme: DIFF_THEMES,
      tokenizeMaxLineLength: 1000,
      useTokenTransformer: true,
      lineDiffType: "none" as const,
    }),
    [],
  );
  return (
    <WorkerPoolContextProvider poolOptions={poolOptions} highlighterOptions={highlighterOptions}>
      {props.children}
    </WorkerPoolContextProvider>
  );
}

function parseGitPatch(patch: string, path: string): FileDiffMetadata | undefined {
  if (patch.trim() === "") {
    return undefined;
  }
  try {
    const parsed = parsePatchFiles(patch, `comprehende:${path}:${patchKey(patch)}`);
    return parsed[0]?.files[0];
  } catch (cause: unknown) {
    console.error(cause);
    return undefined;
  }
}

function patchKey(patch: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < patch.length; i++) {
    hash ^= patch.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${patch.length.toString(16)}:${(hash >>> 0).toString(16)}`;
}

function loadDiffFiles(fileDiff: FileDiffMetadata): Promise<FileDiffLoadedFiles> {
  return loadDiffFilesWith(fileDiff, fetchFile);
}

const StableFileDiff = memo(function StableFileDiff(props: {
  fileDiff: FileDiffMetadata;
  split: boolean;
  wrap: boolean;
  themeType: "light" | "dark";
  loadFiles: boolean;
  excerpt: boolean;
  extraCss: string;
  annotations?: DiffLineAnnotation<RowMeta>[];
  onPostRender?: (node: HTMLElement) => void;
}) {
  const onPostRenderRef = useRef(props.onPostRender);
  onPostRenderRef.current = props.onPostRender;
  const options = useMemo(
    () => ({
      theme: DIFF_THEMES,
      themeType: props.themeType,
      diffStyle: props.split ? ("split" as const) : ("unified" as const),
      overflow: props.wrap ? ("wrap" as const) : ("scroll" as const),
      disableFileHeader: true,
      stickyHeader: false,
      lineDiffType: "none" as const,
      // Pierre's expandUnchanged paints every gap open. Leave it off.
      expansionLineCount: EXPANSION_LINE_COUNT,
      // A focused file renders hunk by hunk with its own hidden-lines rows. Pierre's gap count
      // there would include changed lines the cut hides, so a plain bar marks real gaps.
      hunkSeparators: props.excerpt ? ("simple" as const) : GAP_SEPARATOR,
      ...(props.loadFiles ? { loadDiffFiles } : {}),
      unsafeCSS: `${PIERRE_UNSAFE_CSS}\n${GAP_CSS}\n${props.extraCss}`,
      onPostRender: (node: HTMLElement, _instance: unknown, phase: string) => {
        if (phase === "unmount") return;
        onPostRenderRef.current?.(node);
      },
    }),
    [props.excerpt, props.extraCss, props.loadFiles, props.split, props.themeType, props.wrap],
  );
  return (
    <FileDiff
      className="block w-full"
      fileDiff={props.fileDiff}
      options={options}
      lineAnnotations={props.annotations}
      renderAnnotation={props.annotations === undefined ? undefined : renderRowAnnotation}
    />
  );
});

const StablePierreFile = memo(function StablePierreFile(props: {
  path: string;
  contents: string;
  wrap: boolean;
  themeType: "light" | "dark";
  annotations?: FileAnnotation[];
  extraCss?: string;
  onGutterWidth?: (width: number) => void;
}) {
  const onGutterWidthRef = useRef(props.onGutterWidth);
  onGutterWidthRef.current = props.onGutterWidth;
  const file = useMemo(
    () => ({
      name: props.path,
      contents: props.contents,
      cacheKey: `${props.path}:${props.contents.length}:${props.contents.slice(0, 32)}:${props.annotations?.length ?? 0}`,
    }),
    [props.annotations?.length, props.contents, props.path],
  );
  const options = useMemo(
    () => ({
      theme: DIFF_THEMES,
      themeType: props.themeType,
      overflow: props.wrap ? ("wrap" as const) : ("scroll" as const),
      disableFileHeader: true,
      stickyHeader: false,
      onPostRender: (node: HTMLElement, _instance: unknown, phase: string) => {
        if (phase === "unmount") return;
        const cell = (node.shadowRoot ?? node).querySelector("[data-column-number]");
        if (cell !== null) {
          onGutterWidthRef.current?.(cell.getBoundingClientRect().width);
        }
      },
      unsafeCSS: [
        PIERRE_UNSAFE_CSS,
        props.annotations === undefined ? "" : BLAME_CSS,
        props.extraCss ?? "",
      ].join("\n"),
    }),
    [props.annotations === undefined, props.extraCss, props.themeType, props.wrap],
  );
  return (
    <File
      className="block w-full"
      file={file}
      options={options}
      lineAnnotations={props.annotations}
      renderAnnotation={props.annotations === undefined ? undefined : renderBlameAnnotation}
    />
  );
});

export type FileAnnotation = {
  lineNumber: number;
  metadata: {
    sha: string;
    author: string;
    timestamp: number;
    summary: string;
    lines: number;
    /** First line of the run this stamp heads. */
    start: number;
    /** The commit is one of the commits under review. */
    inRange: boolean;
  };
};

type RowMeta = {
  comments?: FileComment[];
  focusId?: string;
  movedLabel?: MovedLabel;
  notes?: LetteredNote[];
};

function rowAnnotations(
  comments: readonly FileComment[] | undefined,
  moves: readonly MovedMark[] | undefined,
  notes: readonly LetteredNote[] | undefined,
  filePath: string,
  focusId?: string,
): DiffLineAnnotation<RowMeta>[] | undefined {
  const byKey = new Map<string, DiffLineAnnotation<RowMeta>>();
  for (const note of notes ?? []) {
    const key = `${note.side}:${note.line}`;
    const existing = byKey.get(key);
    if (existing === undefined) {
      byKey.set(key, {
        side: note.side === "old" ? "deletions" : "additions",
        lineNumber: note.line,
        metadata: { notes: [note] },
      });
    } else {
      existing.metadata.notes?.push(note);
    }
  }
  if (comments !== undefined) {
    for (const list of commentsByLine(comments).values()) {
      const first = list[0];
      if (first === undefined) {
        continue;
      }
      const key = `${first.side}:${first.line}`;
      const existing = byKey.get(key);
      if (existing === undefined) {
        byKey.set(key, {
          side: first.side === "old" ? "deletions" : "additions",
          lineNumber: first.line,
          metadata: { comments: list, focusId },
        });
      } else {
        existing.metadata.comments = list;
        existing.metadata.focusId = focusId;
      }
    }
  }
  if (moves !== undefined) {
    for (const mark of moves) {
      const key = `${mark.side}:${mark.anchor}`;
      const existing = byKey.get(key);
      const movedLabel = movedMarkLabel(filePath, mark);
      if (existing === undefined) {
        byKey.set(key, {
          side: mark.side === "old" ? "deletions" : "additions",
          lineNumber: mark.anchor,
          metadata: { movedLabel },
        });
      } else {
        existing.metadata.movedLabel = movedLabel;
      }
    }
  }
  const annotations = [...byKey.values()];
  return annotations.length === 0 ? undefined : annotations;
}

function renderRowAnnotation(annotation: DiffLineAnnotation<RowMeta>): ReactNode {
  const { comments, focusId, movedLabel, notes } = annotation.metadata;
  // The moved chip comes last: it hangs on the line before its block, so it sits just above it.
  return (
    <>
      {notes !== undefined && notes.length > 0 ? <NotePin notes={notes} /> : null}
      {comments !== undefined && comments.length > 0 ? (
        <CommentPin comments={comments} focusId={focusId} />
      ) : null}
      {movedLabel !== undefined ? <MovedChip label={movedLabel} /> : null}
    </>
  );
}

function renderBlameAnnotation(annotation: LineAnnotation<FileAnnotation["metadata"]>): ReactNode {
  return <BlameStamp meta={annotation.metadata} />;
}

// A fixed locale and zone, so a stamp reads the same on every machine.
const STAMP_DATE = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function InReviewBadge() {
  return (
    <Badge variant="ref" size="sm" className="h-4 shrink-0 px-1">
      In this review
    </Badge>
  );
}

/** Heads one blame run: the commit that last changed the lines below it. */
export function BlameStamp(props: {
  meta: FileAnnotation["metadata"];
  /** Set on the stamp over the file, which sits outside Pierre's code column. */
  indent?: number;
}) {
  const { meta } = props;
  const day = STAMP_DATE.format(new Date(meta.timestamp * 1000));
  const end = meta.start + meta.lines - 1;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          style={{ paddingLeft: props.indent === undefined ? undefined : props.indent + 12 }}
          className={cn(
            "grid h-[var(--diff-line-height)] min-w-0 cursor-default [grid-template-columns:3.75rem_6rem_minmax(0,1fr)_minmax(0,auto)_auto] items-center gap-2 bg-[color-mix(in_srgb,var(--muted)_50%,var(--diff-canvas))] px-3 font-sans text-xs leading-none text-muted-foreground",
            props.indent === undefined
              ? "border-t border-border"
              : meta.inRange && "shadow-[inset_2px_0_0_var(--primary)]",
          )}
        >
          <code className="font-mono text-foreground">{shortSha(meta.sha)}</code>
          <span className="flex">{meta.inRange ? <InReviewBadge /> : null}</span>
          <span className="truncate">{meta.inRange ? meta.summary : null}</span>
          <span className="truncate">
            {meta.author}
            <span aria-hidden> · </span>
            <span className="tabular-nums">{day}</span>
          </span>
          <span className="min-w-[6.5rem] pl-2 text-right tabular-nums">
            {meta.lines === 1 ? `Line ${meta.start}` : `Lines ${meta.start}–${end}`}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" align="start" className="max-w-[min(32rem,calc(100vw-2rem))]">
        {meta.summary !== "" ? <span className="block">{meta.summary}</span> : null}
        <span className="block text-background/70">
          {meta.author}
          <span aria-hidden> · </span>
          <span className="tabular-nums">{day}</span>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Moved lines are not new code. A slate wash, a slate gutter bar, and plain line numbers keep them
 * apart from real adds and deletes. The bar and the number colour read Pierre's add/del base, so
 * the rule points that base at `--moved` for these lines only.
 */
function movedLinesCss(moves: readonly MovedMark[] | undefined): string {
  if (moves === undefined || moves.length === 0) {
    return "";
  }
  const rule = (type: string, side: MovedMark["side"]) => {
    const numbers = moves
      .filter((mark) => mark.side === side)
      .flatMap((mark) => Array.from({ length: mark.end - mark.line + 1 }, (_, i) => mark.line + i));
    if (numbers.length === 0) {
      return "";
    }
    const match = numbers.map((n) => `[data-line="${n}"],[data-column-number="${n}"]`).join(",");
    return `[data-line-type="${type}"]:is(${match}) {
  --diffs-deletion-base: var(--moved) !important;
  --diffs-addition-base: var(--moved) !important;
  background-color: color-mix(in srgb, var(--moved) 14%, var(--diff-canvas)) !important;
}
[data-line-type="${type}"][data-column-number]:is(${match}) {
  background-color: color-mix(in srgb, var(--moved) 14%, var(--diff-canvas)) !important;
  color: color-mix(in srgb, var(--diff-fg) 80%, transparent) !important;
}`;
  };
  return `${rule("change-deletion", "old")}\n${rule("change-addition", "new")}`;
}

const ADDED_FILE_CSS = `
[data-line-type="change-addition"] {
  background-color: var(--diff-canvas) !important;
}
[data-line-type="change-addition"][data-column-number] {
  background-color: var(--diff-canvas) !important;
  color: var(--add) !important;
}`;

export function PierreFile(props: {
  path: string;
  contents: string;
  wrap: boolean;
  annotations?: FileAnnotation[];
  /** Extra CSS for Pierre's shadow tree, such as blame gutter tints. */
  extraCss?: string;
  /** Width of the line-number gutter once Pierre has painted it. */
  onGutterWidth?: (width: number) => void;
}) {
  const { resolved } = useTheme();
  return (
    <div className="min-h-0 min-w-0">
      <StablePierreFile
        path={props.path}
        contents={props.contents}
        wrap={props.wrap}
        themeType={resolved}
        annotations={props.annotations}
        extraCss={props.extraCss}
        onGutterWidth={props.onGutterWidth}
      />
    </div>
  );
}

export function PierreFileDiff(props: {
  path: string;
  patch: string;
  split: boolean;
  wrap: boolean;
  splitRatio: number;
  onSplitRatio: (ratio: number) => void;
  /** False for grouped subset patches. Full-file blobs do not match those patches. */
  hydrate?: boolean;
  /** One block of a focused file. Separators show no line counts. */
  excerpt?: boolean;
  /** Digits of the file's largest line number, so every block of one file has the same gutter. */
  gutterDigits?: number;
  comments?: FileComment[];
  moves?: readonly MovedMark[];
  notes?: readonly LetteredNote[];
  focusCommentId?: string;
  /** A new file. Its lines keep the green gutter but drop the green line wash. */
  added?: boolean;
}) {
  const {
    path,
    patch,
    split,
    wrap,
    splitRatio,
    onSplitRatio,
    hydrate = true,
    excerpt = false,
    gutterDigits,
    comments,
    moves,
    notes,
    focusCommentId,
    added = false,
  } = props;
  const { resolved } = useTheme();
  const extraCss = useMemo(
    () => `${added ? ADDED_FILE_CSS : ""}\n${movedLinesCss(moves)}`,
    [added, moves],
  );
  const parsed = useMemo(() => parseGitPatch(patch, path), [patch, path]);
  const [fileDiff, setFileDiff] = useState(parsed);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<GapPin | null>(null);
  const pinGen = useRef(0);

  useEffect(() => {
    setFileDiff(parsed);
  }, [parsed]);

  useEffect(() => {
    if (parsed === undefined || !hydrate || !canHydrateDiff(parsed)) {
      return;
    }
    let cancelled = false;
    void loadDiffFiles(parsed)
      .then((files) => {
        if (cancelled || !parsed.isPartial) {
          return;
        }
        try {
          setFileDiff(hydratePartialDiff("clone", parsed, files));
        } catch (cause: unknown) {
          // Keep the parsed subset patch. Full blobs only match when this group has every hunk.
          console.error(cause);
        }
      })
      .catch((cause: unknown) => {
        console.error(cause);
      });
    return () => {
      cancelled = true;
    };
  }, [parsed, hydrate]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper === null) return;
    const onClick = (event: MouseEvent) => {
      const path = event.composedPath();
      if (isPlainDownClick(path, event.shiftKey)) return;
      const sep = gapSeparator(path);
      const index = sep?.getAttribute("data-expand-index");
      const scroller = reviewScroller(wrapper);
      if (sep === undefined || index == null || scroller === undefined) return;
      pinGen.current += 1;
      pinRef.current = {
        scroller,
        top: sep.getBoundingClientRect().top,
        index,
        scrollHeight: scroller.scrollHeight,
        createdAt: Date.now(),
      };
    };
    wrapper.addEventListener("click", onClick, true);
    return () => wrapper.removeEventListener("click", onClick, true);
  }, [fileDiff !== undefined]);

  const onPostRender = (node: HTMLElement) => {
    const pin = pinRef.current;
    if (pin === null) return;
    const gen = pinGen.current;
    pinRef.current = null;
    watchGapPin(
      pin,
      node,
      () => pinGen.current === gen,
      () => undefined,
    );
  };

  const annotations = useMemo(
    () => rowAnnotations(comments, moves, notes, path, focusCommentId),
    [comments, focusCommentId, moves, notes, path],
  );

  if (fileDiff === undefined) {
    return <p className="px-3 py-2 text-xs text-warn">Could not render this git patch.</p>;
  }

  const splitPanes = split && splitHasTwoSides(fileDiff.type);

  return (
    <div
      ref={wrapperRef}
      className="relative min-w-0"
      style={
        {
          "--comprehende-split-left": `${splitRatio}fr`,
          "--comprehende-split-right": `${1 - splitRatio}fr`,
          "--diffs-min-number-column-width":
            gutterDigits === undefined ? undefined : `${gutterDigits}ch`,
        } as CSSProperties
      }
    >
      <StableFileDiff
        fileDiff={fileDiff}
        split={splitPanes}
        wrap={wrap}
        themeType={resolved}
        loadFiles={hydrate}
        excerpt={excerpt}
        extraCss={extraCss}
        annotations={annotations}
        onPostRender={onPostRender}
      />
      {splitPanes ? <SplitResizeHandle ratio={splitRatio} onRatio={onSplitRatio} /> : null}
    </div>
  );
}

export type Snippet = { lang: string | null; value: string };

/** One code block of a Markdown file, as Pierre sees a file. */
function snippetFile(code: Snippet, contents = code.value) {
  return {
    name: "code",
    contents,
    lang:
      (code.lang === null ? undefined : fenceLanguage(code.lang, EXTENSION_TO_FILE_FORMAT)) ??
      "text",
    cacheKey: `snippet:${code.lang ?? ""}:${patchKey(contents)}`,
  };
}

const SNIPPET_OPTIONS = {
  theme: DIFF_THEMES,
  disableFileHeader: true,
  disableLineNumbers: true,
  stickyHeader: false,
  unsafeCSS: PIERRE_UNSAFE_CSS,
} as const;

/** A code block in rendered Markdown, with the colors of its language and no line numbers. */
export const PierreSnippet = memo(function PierreSnippet(props: { code: Snippet; wrap: boolean }) {
  const { resolved } = useTheme();
  const file = useMemo(() => snippetFile(props.code), [props.code]);
  const options = useMemo(
    () => ({
      ...SNIPPET_OPTIONS,
      themeType: resolved,
      overflow: props.wrap ? ("wrap" as const) : ("scroll" as const),
    }),
    [props.wrap, resolved],
  );
  return <File className="block w-full" file={file} options={options} />;
});

/** Two versions of one code block in rendered Markdown, as a line diff with every line shown. */
export const PierreSnippetDiff = memo(function PierreSnippetDiff(props: {
  before: Snippet;
  after: Snippet;
  split: boolean;
  wrap: boolean;
}) {
  const { resolved } = useTheme();
  const fileDiff = useMemo(() => {
    // A diff marks a side that ends without a line break. A code block has no such end.
    const file = (code: Snippet) => snippetFile(code, `${code.value}\n`);
    return parseDiffFromFile(file(props.before), file(props.after));
  }, [props.after, props.before]);
  const options = useMemo(
    () => ({
      ...SNIPPET_OPTIONS,
      themeType: resolved,
      diffStyle: props.split ? ("split" as const) : ("unified" as const),
      overflow: props.wrap ? ("wrap" as const) : ("scroll" as const),
      lineDiffType: "none" as const,
      expandUnchanged: true,
    }),
    [props.split, props.wrap, resolved],
  );
  return <FileDiff className="block w-full" fileDiff={fileDiff} options={options} />;
});

export function SplitResizeHandle(props: { ratio: number; onRatio: (ratio: number) => void }) {
  const drag = useRef<{ startX: number; start: number; width: number } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const parent = event.currentTarget.parentElement;
    if (parent === null) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startX: event.clientX,
      start: props.ratio,
      width: parent.getBoundingClientRect().width,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (state === null || state.width === 0) {
      return;
    }
    props.onRatio(clampSplitRatio(state.start + (event.clientX - state.startX) / state.width));
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize split diff"
      aria-valuemin={Math.round(MIN_SPLIT * 100)}
      aria-valuemax={Math.round(MAX_SPLIT * 100)}
      aria-valuenow={Math.round(props.ratio * 100)}
      tabIndex={0}
      className={cn(
        "absolute inset-y-0 z-10 flex w-3 -translate-x-1/2 cursor-col-resize touch-none items-center justify-center select-none",
        "after:absolute after:inset-y-0 after:w-px after:bg-border hover:after:bg-primary/70 motion-safe:after:transition-colors",
      )}
      style={{ left: `${props.ratio * 100}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => props.onRatio(0.5)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          props.onRatio(clampSplitRatio(props.ratio - 0.05));
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          props.onRatio(clampSplitRatio(props.ratio + 0.05));
        } else if (event.key === "Home" || event.key === "Enter") {
          event.preventDefault();
          props.onRatio(0.5);
        }
      }}
    >
      <div className="z-10 flex h-8 w-3 items-center justify-center rounded-sm border border-border bg-card">
        <GripVerticalIcon className="size-2.5 text-muted-foreground" />
      </div>
    </div>
  );
}
