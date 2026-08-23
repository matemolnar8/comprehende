import {
  hydratePartialDiff,
  parsePatchFiles,
  type FileDiffLoadedFiles,
  type FileDiffMetadata,
  type LineAnnotation,
} from "@pierre/diffs";
import { File, FileDiff, WorkerPoolContextProvider } from "@pierre/diffs/react";
import DiffsWorker from "@pierre/diffs/worker/worker.js?worker";
import { GripVerticalIcon } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { fetchFile } from "./api.ts";
import { EXPANSION_LINE_COUNT, GAP_CSS, GAP_SEPARATOR } from "@/lib/gap-style.ts";
import { canHydrateDiff, loadDiffFilesWith } from "@/lib/load-diff-files.ts";
import {
  overflowAncestor,
  parseExpandClick,
  restorePinnedExpand,
  shouldPinExpand,
  type PendingPin,
} from "@/lib/pin-gap-expand.ts";
import { DIFF_THEMES } from "@/lib/theme.ts";
import { useTheme } from "@/lib/ThemeProvider.tsx";
import { cn } from "@/lib/utils.ts";

/** GitHub Primer diffblob colors, mapped into Pierre's shadow tree. */
const PIERRE_UNSAFE_CSS = `
[data-diffs-header],
[data-diff],
[data-file],
[data-error-wrapper],
[data-virtualizer-buffer] {
  --diffs-header-font-family: var(--font-sans) !important;
  --diffs-font-family: var(--font-mono) !important;
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

[data-diff-type="split"][data-overflow="scroll"] {
  grid-template-columns: minmax(0, var(--comprehende-split-left, 1fr)) minmax(0, var(--comprehende-split-right, 1fr)) !important;
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

const MIN_SPLIT = 0.2;
const MAX_SPLIT = 0.8;

export function clampSplitRatio(ratio: number): number {
  return Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, ratio));
}

export function PierreDiffPool(props: { children: ReactNode }) {
  const poolOptions = useMemo(() => {
    const cores = typeof navigator === "undefined" ? 4 : Math.max(1, navigator.hardwareConcurrency || 4);
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
    const parsed = parsePatchFiles(patch, `comprehende:${path}`);
    return parsed[0]?.files[0];
  } catch {
    return undefined;
  }
}

function loadDiffFiles(fileDiff: FileDiffMetadata): Promise<FileDiffLoadedFiles> {
  return loadDiffFilesWith(fileDiff, fetchFile);
}

const StableFileDiff = memo(function StableFileDiff(props: {
  fileDiff: FileDiffMetadata;
  split: boolean;
  wrap: boolean;
  themeType: "light" | "dark";
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
      hunkSeparators: GAP_SEPARATOR,
      loadDiffFiles,
      unsafeCSS: `${PIERRE_UNSAFE_CSS}\n${GAP_CSS}`,
      onPostRender: (node: HTMLElement, _instance: unknown, phase: string) => {
        if (phase === "unmount") return;
        onPostRenderRef.current?.(node);
      },
    }),
    [props.split, props.themeType, props.wrap],
  );
  return <FileDiff className="block w-full" fileDiff={props.fileDiff} options={options} />;
});

const StablePierreFile = memo(function StablePierreFile(props: {
  path: string;
  contents: string;
  wrap: boolean;
  themeType: "light" | "dark";
  annotations?: FileAnnotation[];
}) {
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
      unsafeCSS: PIERRE_UNSAFE_CSS,
    }),
    [props.themeType, props.wrap],
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
    lines: number;
  };
};

function renderBlameAnnotation(annotation: LineAnnotation<FileAnnotation["metadata"]>): ReactNode {
  const meta = annotation.metadata;
  const day = new Date(meta.timestamp * 1000).toISOString().slice(0, 10);
  return (
    <div className="flex min-w-0 items-baseline gap-2 px-2 py-1 font-sans text-[11px] text-muted-foreground">
      <code className="text-primary">{meta.sha.slice(0, 7)}</code>
      <span className="min-w-0 truncate">{meta.author}</span>
      <span className="shrink-0 tabular-nums">{day}</span>
      {meta.lines > 1 ? <span className="shrink-0 tabular-nums">{meta.lines} lines</span> : null}
    </div>
  );
}

export function PierreFile(props: {
  path: string;
  contents: string;
  wrap: boolean;
  annotations?: FileAnnotation[];
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
}) {
  const { path, patch, split, wrap, splitRatio, onSplitRatio } = props;
  const { resolved } = useTheme();
  const parsed = useMemo(() => parseGitPatch(patch, path), [patch, path]);
  const [fileDiff, setFileDiff] = useState(parsed);
  const pinRef = useRef<PendingPin | null>(null);

  useEffect(() => {
    setFileDiff(parsed);
  }, [parsed]);

  useEffect(() => {
    if (parsed === undefined || !canHydrateDiff(parsed)) {
      return;
    }
    let cancelled = false;
    void loadDiffFiles(parsed).then((files) => {
      if (cancelled || !parsed.isPartial) {
        return;
      }
      setFileDiff(hydratePartialDiff("clone", parsed, files));
    });
    return () => {
      cancelled = true;
    };
  }, [parsed]);

  const onExpandClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    const parsedClick = parseExpandClick(event.nativeEvent.composedPath());
    if (parsedClick === undefined || !shouldPinExpand(parsedClick.kind)) return;
    const scroller = overflowAncestor(event.currentTarget);
    if (scroller === undefined) return;
    pinRef.current = {
      scroller,
      top: parsedClick.anchor.getBoundingClientRect().top,
      index: parsedClick.index,
      selector: parsedClick.selector,
      createdAt: Date.now(),
    };
  };

  const onPostRender = useCallback((node: HTMLElement) => {
    const pinned = pinRef.current;
    if (pinned === null) return;
    const finish = () => {
      if (pinRef.current !== pinned) return;
      const result = restorePinnedExpand(pinned, node);
      if (result !== "pending") pinRef.current = null;
    };
    if (restorePinnedExpand(pinned, node) !== "pending") {
      pinRef.current = null;
      return;
    }
    requestAnimationFrame(finish);
  }, []);

  if (fileDiff === undefined) {
    return <p className="px-3 py-2 text-xs text-warn">Could not render this git patch.</p>;
  }

  return (
    <div
      className="relative min-w-0"
      style={
        {
          "--comprehende-split-left": `${splitRatio}fr`,
          "--comprehende-split-right": `${1 - splitRatio}fr`,
        } as CSSProperties
      }
      onClickCapture={onExpandClickCapture}
    >
      <StableFileDiff
        fileDiff={fileDiff}
        split={split}
        wrap={wrap}
        themeType={resolved}
        onPostRender={onPostRender}
      />
      {split ? <SplitResizeHandle ratio={splitRatio} onRatio={onSplitRatio} /> : null}
    </div>
  );
}

function SplitResizeHandle(props: { ratio: number; onRatio: (ratio: number) => void }) {
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
