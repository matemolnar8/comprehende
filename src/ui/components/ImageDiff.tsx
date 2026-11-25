import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import { resourceHref } from "../api.ts";
import { ChevronsLeftRightIcon } from "lucide-react";
import {
  crispScale,
  fitImageStage,
  fitTwoColumnStage,
  stageScaleLabel,
  type ImageStageSize,
  type ImageZoom,
} from "../lib/image-stage.ts";
import { useImage, type ImageState, type LoadedImage } from "../lib/image-loader.ts";
import { useViewportPriority } from "../lib/near-viewport.ts";
import { queuePixelDiff } from "../lib/pixel-diff.ts";
import { Segmented, SegmentedItem } from "@/components/ui/segmented.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import type { FileStatus } from "../api.ts";
import styles from "./ImageDiff.module.css";

export type ImageMode = "side-by-side" | "slider" | "diff";

const PAD = 12;
// A small image grows to fill the card, at most to twice its size.
const MAX_UPSCALE = 2;
const GAP = 12;
// The 1px ring room around the stage and the card border, on both sides.
const CARD_CHROME = 4;

/** One value for every image card: switching one card switches them all. */
function sharedChoice<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const set = (next: T) => {
    value = next;
    for (const listener of listeners) {
      listener();
    }
  };
  const use = () => useSyncExternalStore(subscribe, () => value);
  const get = () => value;
  return [use, set, get] as const;
}

const [useSharedMode, setSharedMode] = sharedChoice<ImageMode>("side-by-side");
const [useSharedZoom, setSharedZoom] = sharedChoice<ImageZoom>("fit");

type Size = { width: number; height: number };

// Screenshots in one change mostly share a size, so a card that has not read its images yet
// takes the size of the first image read. That keeps the page height close to the real one.
const [useFirstImageSize, setFirstImageSize, getFirstImageSize] = sharedChoice<Size | undefined>(
  undefined,
);

/**
 * `onCardWidth` gets the width a one-sided card needs to show its image at the fit height,
 * so the card does not leave empty space beside a narrow image.
 */
export function ImageDiff(props: {
  path: string;
  status: FileStatus;
  onCardWidth: (width: number) => void;
}) {
  const { path, status, onCardWidth } = props;
  const hasOld = status !== "added";
  const hasNew = status !== "deleted";
  const oldUrl = hasOld ? resourceHref({ kind: "image", path, side: "old" }) : undefined;
  const newUrl = hasNew ? resourceHref({ kind: "image", path, side: "new" }) : undefined;
  const both = oldUrl !== undefined && newUrl !== undefined;
  const host = useHostBox();
  const priority = useViewportPriority(host.ref);
  const oldImage = imageSide(oldUrl, useImage(oldUrl, priority));
  const newImage = imageSide(newUrl, useImage(newUrl, priority));
  const mode = useSharedMode();
  const zoom = useSharedZoom();
  const firstImageSize = useFirstImageSize();
  const [wipe, setWipe] = useState(50);

  const firstLoaded = oldImage.loaded ?? newImage.loaded;
  useEffect(() => {
    if (firstLoaded !== undefined && getFirstImageSize() === undefined) {
      setFirstImageSize({ width: firstLoaded.width, height: firstLoaded.height });
    }
  }, [firstLoaded]);

  // The caption stays hidden until the size is real.
  const pending = oldImage.pending || newImage.pending;
  const estimate = pending ? firstImageSize : undefined;
  const naturalWidth = Math.max(oldImage.width, newImage.width, estimate?.width ?? 0);
  const naturalHeight = Math.max(oldImage.height, newImage.height, estimate?.height ?? 0);
  const inner = Math.max(0, host.width - PAD * 2);
  const stage =
    zoom === "actual"
      ? { width: naturalWidth, height: naturalHeight, scale: 1 }
      : both && mode === "side-by-side"
        ? fitTwoColumnStage(naturalWidth, naturalHeight, inner, host.maxHeight, GAP, MAX_UPSCALE)
        : fitImageStage(naturalWidth, naturalHeight, inner, host.maxHeight, MAX_UPSCALE);
  const ready =
    stage.width > 0 &&
    (oldImage.loaded !== undefined || newImage.loaded !== undefined || estimate !== undefined);
  const singleWidth =
    both || pending
      ? 0
      : zoom === "actual"
        ? naturalWidth
        : fitImageStage(naturalWidth, naturalHeight, Infinity, host.maxHeight, MAX_UPSCALE).width;

  useEffect(() => {
    if (singleWidth > 0) {
      onCardWidth(singleWidth + PAD * 2 + CARD_CHROME);
    }
  }, [onCardWidth, singleWidth]);
  const missing =
    oldImage.error && newImage.error
      ? "These images are not in this clone. Fetch Git LFS objects, then refresh."
      : oldImage.error
        ? "The base image is not in this clone. Fetch Git LFS objects, then refresh."
        : newImage.error
          ? "The head image is not in this clone. Fetch Git LFS objects, then refresh."
          : null;

  return (
    <div ref={host.ref} className="min-w-0">
      {missing !== null ? <p className="px-3 py-2 text-sm text-warn">{missing}</p> : null}
      {!ready && missing === null ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">Reading image…</p>
      ) : null}
      {ready ? (
        <figure className="flex w-full flex-col items-center gap-2" style={{ padding: PAD }}>
          <div className={cn("w-full", zoom === "actual" && "max-h-[70vh] overflow-auto")}>
            <div className="mx-auto w-max p-px">
              {mode === "side-by-side" || !both ? (
                <div className="flex" style={{ gap: GAP }}>
                  {hasOld ? (
                    <Labeled width={stage.width} left="Base">
                      <StageFrame width={stage.width} height={stage.height}>
                        {oldImage.error ? (
                          <Missing />
                        ) : oldImage.loaded !== undefined ? (
                          <StageImage src={oldImage.loaded.src} alt="Base" stage={stage} />
                        ) : null}
                      </StageFrame>
                    </Labeled>
                  ) : null}
                  {hasNew ? (
                    <Labeled width={stage.width} left="Head">
                      <StageFrame width={stage.width} height={stage.height}>
                        {newImage.error ? (
                          <Missing />
                        ) : newImage.loaded !== undefined ? (
                          <StageImage src={newImage.loaded.src} alt="Head" stage={stage} />
                        ) : null}
                      </StageFrame>
                    </Labeled>
                  ) : null}
                </div>
              ) : null}
              {mode === "slider" && both ? (
                <WipeStage
                  oldSrc={oldImage.loaded?.src}
                  newSrc={newImage.loaded?.src}
                  stage={stage}
                  wipe={wipe}
                  onWipe={setWipe}
                />
              ) : null}
              {mode === "diff" && both && !oldImage.error && !newImage.error ? (
                <PixelStage
                  oldImage={oldImage.loaded}
                  newImage={newImage.loaded}
                  near={priority !== "background"}
                  naturalWidth={naturalWidth}
                  naturalHeight={naturalHeight}
                  stage={stage}
                />
              ) : null}
            </div>
          </div>
          <figcaption
            className={cn(
              "flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs tabular-nums text-muted-foreground",
              pending && "invisible",
            )}
          >
            <span>
              {naturalWidth} × {naturalHeight} px · {stageScaleLabel(stage.scale)}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="text-foreground">
                    Zoom <span className="text-muted-foreground">· all images</span>
                  </span>
                  <Segmented label="Zoom" size="sm">
                    <SegmentedItem active={zoom === "fit"} onClick={() => setSharedZoom("fit")}>
                      Fit
                    </SegmentedItem>
                    <SegmentedItem
                      active={zoom === "actual"}
                      onClick={() => setSharedZoom("actual")}
                    >
                      100%
                    </SegmentedItem>
                  </Segmented>
                </span>
              </TooltipTrigger>
              <TooltipContent>Applies to every image</TooltipContent>
            </Tooltip>
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}

/** The compare mode for every image card. Each copy shows and sets the same shared mode. */
export function ImageModeControl() {
  const mode = useSharedMode();
  return (
    <Segmented label="Compare" size="sm">
      <SegmentedItem
        active={mode === "side-by-side"}
        onClick={() => setSharedMode("side-by-side")}
        hint="Base and head next to each other"
      >
        Side by side
      </SegmentedItem>
      <SegmentedItem
        active={mode === "slider"}
        onClick={() => setSharedMode("slider")}
        hint="Drag across the image to compare"
      >
        Slider
      </SegmentedItem>
      <SegmentedItem
        active={mode === "diff"}
        onClick={() => setSharedMode("diff")}
        hint="Show only the pixels that differ"
      >
        Pixel diff
      </SegmentedItem>
    </Segmented>
  );
}

/** Labels in a row on the frame edges, so they never cover a pixel. */
function Labeled(props: { width: number; left: string; right?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5" style={{ width: props.width }}>
      <div className="flex h-4 items-center justify-between gap-2 text-xs leading-none font-medium text-muted-foreground tabular-nums">
        <span className="truncate">{props.left}</span>
        {props.right !== undefined ? <span className="shrink-0">{props.right}</span> : null}
      </div>
      {props.children}
    </div>
  );
}

function StageFrame(props: {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      ref={props.ref}
      className={cn(
        styles.stage,
        "relative shrink-0 overflow-hidden rounded-md ring-1 ring-border",
        props.className,
      )}
      style={{ width: props.width, height: props.height }}
      onPointerDown={props.onPointerDown}
      onPointerMove={props.onPointerMove}
    >
      {props.children}
    </div>
  );
}

function StageImage(props: { src: string; alt: string; stage: ImageStageSize }) {
  const { width, height, scale } = props.stage;
  return (
    <img
      src={props.src}
      alt={props.alt}
      width={width}
      height={height}
      className="absolute top-0 left-0 max-w-none"
      style={{
        width,
        height,
        objectFit: "contain",
        objectPosition: "left top",
        imageRendering: crispScale(scale) ? "pixelated" : "auto",
      }}
    />
  );
}

function Missing() {
  return (
    <p className="flex h-full items-center px-3 text-sm text-muted-foreground">Image missing</p>
  );
}

/** The images show once both are loaded. */
function WipeStage(props: {
  oldSrc: string | undefined;
  newSrc: string | undefined;
  stage: ImageStageSize;
  wipe: number;
  onWipe: (value: number) => void;
}) {
  const { oldSrc, newSrc, stage, wipe, onWipe } = props;
  const frameRef = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    const frame = frameRef.current;
    if (frame === null) {
      return;
    }
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0) {
      return;
    }
    onWipe(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    move(event.clientX);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.buttons === 0) {
      return;
    }
    move(event.clientX);
  };

  // Base sits on the left and head on the right, the same as side by side.
  return (
    <figure className="group relative shrink-0">
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(wipe)}
        aria-label="Drag to compare"
        className="sr-only"
        onChange={(event) => onWipe(Number(event.target.value))}
      />
      <Labeled width={stage.width} left="Base" right="Head">
        <StageFrame
          ref={frameRef}
          width={stage.width}
          height={stage.height}
          className="cursor-col-resize touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        >
          {/* Clip both sides, so empty or transparent base area shows the bench, not the head. */}
          {oldSrc !== undefined && newSrc !== undefined ? (
            <>
              <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${wipe}%)` }}>
                <StageImage src={newSrc} alt="Head" stage={stage} />
              </div>
              <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
                <StageImage src={oldSrc} alt="Base" stage={stage} />
              </div>
            </>
          ) : null}
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{ left: `${wipe}%` }}
            aria-hidden
          >
            <span className="absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 bg-primary" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="pointer-events-auto absolute top-1/2 left-0 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-card group-has-[:focus-visible]:ring-2 group-has-[:focus-visible]:ring-ring/60">
                  <ChevronsLeftRightIcon className="size-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>Drag to compare</TooltipContent>
            </Tooltip>
          </div>
        </StageFrame>
      </Labeled>
    </figure>
  );
}

function PixelStage(props: {
  oldImage: LoadedImage | undefined;
  newImage: LoadedImage | undefined;
  near: boolean;
  naturalWidth: number;
  naturalHeight: number;
  stage: ImageStageSize;
}) {
  const { oldImage, newImage, near, naturalWidth, naturalHeight } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<{ changed: number; total: number } | "failed" | null>(null);

  useEffect(() => {
    if (!near || oldImage === undefined || newImage === undefined) {
      return;
    }
    let answered = false;
    const job = queuePixelDiff(
      { oldImage, newImage, width: naturalWidth, height: naturalHeight },
      (result) => {
        answered = true;
        if (result === null) {
          setStats("failed");
          return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas == null || ctx == null) {
          return;
        }
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        ctx.drawImage(result.bitmap, 0, 0);
        setStats({ changed: result.changed, total: result.total });
      },
    );
    // The count of an earlier run must not sit over an empty canvas.
    if (!answered) {
      setStats(null);
    }
    return job.cancel;
  }, [near, naturalHeight, naturalWidth, newImage, oldImage]);

  return (
    <figure className="shrink-0">
      <Labeled
        width={props.stage.width}
        left={
          stats === null
            ? ""
            : stats === "failed"
              ? "The pixels could not be compared"
              : `${stats.changed.toLocaleString()} of ${stats.total.toLocaleString()} pixels differ`
        }
      >
        <StageFrame width={props.stage.width} height={props.stage.height}>
          {near ? (
            <canvas
              ref={canvasRef}
              className="block size-full"
              style={{ imageRendering: crispScale(props.stage.scale) ? "pixelated" : "auto" }}
            />
          ) : null}
        </StageFrame>
      </Labeled>
    </figure>
  );
}

type ImageSide = {
  loaded: LoadedImage | undefined;
  error: boolean;
  /** The side exists, and its image has not arrived yet. */
  pending: boolean;
  width: number;
  height: number;
};

function imageSide(url: string | undefined, state: ImageState): ImageSide {
  const loaded = typeof state === "object" ? state : undefined;
  return {
    loaded,
    error: state === "error",
    pending: url !== undefined && state === undefined,
    width: loaded?.width ?? 0,
    height: loaded?.height ?? 0,
  };
}

function useHostBox() {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ width: 0, maxHeight: 0 });

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (node === null) {
      return;
    }
    const measure = () => {
      const width = Math.floor(node.clientWidth);
      const maxHeight = Math.max(120, Math.round(window.innerHeight * 0.7));
      setBox((current) =>
        current.width === width && current.maxHeight === maxHeight ? current : { width, maxHeight },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return { ref: nodeRef, width: box.width, maxHeight: box.maxHeight };
}
