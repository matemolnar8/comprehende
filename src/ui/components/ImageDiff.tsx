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
import { diffRgba } from "../../schema/image-diff.ts";
import { ChevronsLeftRightIcon } from "lucide-react";
import {
  crispScale,
  fitImageStage,
  fitTwoColumnStage,
  stageScaleLabel,
  type ImageStageSize,
  type ImageZoom,
} from "../lib/image-stage.ts";
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

/** One choice for every image card: switching one card switches them all. */
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
  return [use, set] as const;
}

const [useSharedMode, setSharedMode] = sharedChoice<ImageMode>("side-by-side");
const [useSharedZoom, setSharedZoom] = sharedChoice<ImageZoom>("fit");

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
  const oldImage = useLoadedImage(oldUrl);
  const newImage = useLoadedImage(newUrl);
  const host = useHostBox();
  const mode = useSharedMode();
  const zoom = useSharedZoom();
  const [wipe, setWipe] = useState(50);

  const naturalWidth = Math.max(oldImage.naturalWidth, newImage.naturalWidth);
  const naturalHeight = Math.max(oldImage.naturalHeight, newImage.naturalHeight);
  const inner = Math.max(0, host.width - PAD * 2);
  const stage =
    zoom === "actual"
      ? { width: naturalWidth, height: naturalHeight, scale: 1 }
      : both && mode === "side-by-side"
        ? fitTwoColumnStage(naturalWidth, naturalHeight, inner, host.maxHeight, GAP, MAX_UPSCALE)
        : fitImageStage(naturalWidth, naturalHeight, inner, host.maxHeight, MAX_UPSCALE);
  const ready = stage.width > 0 && (oldImage.ok || newImage.ok);
  const singleWidth = both
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
                        {oldUrl !== undefined && !oldImage.error ? (
                          <StageImage src={oldUrl} alt="Base" stage={stage} />
                        ) : (
                          <Missing />
                        )}
                      </StageFrame>
                    </Labeled>
                  ) : null}
                  {hasNew ? (
                    <Labeled width={stage.width} left="Head">
                      <StageFrame width={stage.width} height={stage.height}>
                        {newUrl !== undefined && !newImage.error ? (
                          <StageImage src={newUrl} alt="Head" stage={stage} />
                        ) : (
                          <Missing />
                        )}
                      </StageFrame>
                    </Labeled>
                  ) : null}
                </div>
              ) : null}
              {mode === "slider" && both && oldUrl !== undefined && newUrl !== undefined ? (
                <WipeStage
                  oldUrl={oldUrl}
                  newUrl={newUrl}
                  stage={stage}
                  wipe={wipe}
                  onWipe={setWipe}
                />
              ) : null}
              {mode === "diff" && both && oldImage.element !== null && newImage.element !== null ? (
                <PixelStage
                  oldImage={oldImage.element}
                  newImage={newImage.element}
                  naturalWidth={naturalWidth}
                  naturalHeight={naturalHeight}
                  stage={stage}
                />
              ) : null}
            </div>
          </div>
          <figcaption className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs tabular-nums text-muted-foreground">
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

function WipeStage(props: {
  oldUrl: string;
  newUrl: string;
  stage: ImageStageSize;
  wipe: number;
  onWipe: (value: number) => void;
}) {
  const { oldUrl, newUrl, stage, wipe, onWipe } = props;
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
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${wipe}%)` }}>
            <StageImage src={newUrl} alt="Head" stage={stage} />
          </div>
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
            <StageImage src={oldUrl} alt="Base" stage={stage} />
          </div>
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
  oldImage: HTMLImageElement;
  newImage: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  stage: ImageStageSize;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<{ changed: number; total: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }
    const width = props.naturalWidth;
    const height = props.naturalHeight;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }
    const oldPixels = raster(props.oldImage, width, height);
    const newPixels = raster(props.newImage, width, height);
    const diff = diffRgba(oldPixels, newPixels, width, height);
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(diff.pixels);
    ctx.putImageData(imageData, 0, 0);
    setStats({ changed: diff.changed, total: diff.total });
  }, [props.naturalHeight, props.naturalWidth, props.newImage, props.oldImage]);

  return (
    <figure className="shrink-0">
      <Labeled
        width={props.stage.width}
        left={
          stats === null
            ? ""
            : `${stats.changed.toLocaleString()} of ${stats.total.toLocaleString()} pixels differ`
        }
      >
        <StageFrame width={props.stage.width} height={props.stage.height}>
          <canvas
            ref={canvasRef}
            className="block size-full"
            style={{ imageRendering: crispScale(props.stage.scale) ? "pixelated" : "auto" }}
          />
        </StageFrame>
      </Labeled>
    </figure>
  );
}

type LoadedImage = {
  ok: boolean;
  error: boolean;
  element: HTMLImageElement | null;
  naturalWidth: number;
  naturalHeight: number;
};

function useLoadedImage(url: string | undefined): LoadedImage {
  const [state, setState] = useState<LoadedImage>({
    ok: false,
    error: false,
    element: null,
    naturalWidth: 0,
    naturalHeight: 0,
  });

  useEffect(() => {
    if (url === undefined) {
      setState({ ok: false, error: false, element: null, naturalWidth: 0, naturalHeight: 0 });
      return;
    }
    let cancelled = false;
    setState({ ok: false, error: false, element: null, naturalWidth: 0, naturalHeight: 0 });
    void loadImage(url)
      .then((image) => {
        if (!cancelled) {
          setState({
            ok: true,
            error: false,
            element: image,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ ok: false, error: true, element: null, naturalWidth: 0, naturalHeight: 0 });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image load failed"));
    image.src = url;
  });
}

function raster(image: HTMLImageElement, width: number, height: number): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    return new Uint8ClampedArray(width * height * 4);
  }
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, width, height).data;
}
