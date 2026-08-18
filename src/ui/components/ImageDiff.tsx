import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import { resourceHref } from "../api.ts";
import { diffRgba } from "../../schema/image-diff.ts";
import { fitImageStage, stageCaption } from "../lib/image-stage.ts";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import type { FileStatus } from "../api.ts";

export type ImageMode = "side-by-side" | "slider" | "diff";

export function ImageDiff(props: { path: string; status: FileStatus }) {
  const { path, status } = props;
  const hasOld = status !== "added";
  const hasNew = status !== "deleted";
  const oldUrl = hasOld ? resourceHref({ kind: "image", path, side: "old" }) : undefined;
  const newUrl = hasNew ? resourceHref({ kind: "image", path, side: "new" }) : undefined;
  const both = oldUrl !== undefined && newUrl !== undefined;
  const oldImage = useLoadedImage(oldUrl);
  const newImage = useLoadedImage(newUrl);
  const host = useHostBox();
  const [mode, setMode] = useState<ImageMode>("side-by-side");
  const [wipe, setWipe] = useState(50);

  const naturalWidth = Math.max(oldImage.naturalWidth, newImage.naturalWidth);
  const naturalHeight = Math.max(oldImage.naturalHeight, newImage.naturalHeight);
  const stage = fitImageStage(naturalWidth, naturalHeight, host.width, host.maxHeight);
  const ready = stage.width > 0 && (oldImage.ok || newImage.ok);
  const missing =
    oldImage.error && newImage.error
      ? "These images are not in this clone. Fetch Git LFS objects, then refresh."
      : oldImage.error
        ? "The old image is not in this clone. Fetch Git LFS objects, then refresh."
        : newImage.error
          ? "The new image is not in this clone. Fetch Git LFS objects, then refresh."
          : null;

  return (
    <div ref={host.ref} className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-3 py-2">
        {both ? (
          <div className="flex overflow-hidden rounded-md border border-input">
            <ModeButton active={mode === "side-by-side"} onClick={() => setMode("side-by-side")} hint="Old and new at the same size">
              Side by side
            </ModeButton>
            <ModeButton active={mode === "slider"} onClick={() => setMode("slider")} hint="Drag to wipe between old and new">
              Slider
            </ModeButton>
            <ModeButton active={mode === "diff"} onClick={() => setMode("diff")} hint="Pixels that differ">
              Diff
            </ModeButton>
          </div>
        ) : (
          <span className="font-mono text-[11px] text-muted-foreground">{status === "added" ? "Added" : "Deleted"}</span>
        )}
        {ready ? (
          <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
            {stageCaption(naturalWidth, naturalHeight, stage.scale)}
          </span>
        ) : null}
      </div>
      {missing !== null ? <p className="px-3 py-2 text-sm text-warn">{missing}</p> : null}
      {!ready && missing === null ? <p className="px-3 py-2 text-sm text-muted-foreground">Reading image…</p> : null}
      {ready && (mode === "side-by-side" || !both) ? (
        <div className="flex w-fit max-w-full flex-wrap">
          {hasOld ? (
            <LabeledStage label="Old" width={stage.width} height={stage.height} rule={hasNew}>
              {oldUrl !== undefined && !oldImage.error ? (
                <StageImage src={oldUrl} alt="Old" width={stage.width} height={stage.height} />
              ) : (
                <Missing />
              )}
            </LabeledStage>
          ) : (
            <LabeledStage label="Old" width={stage.width} height={stage.height}>
              <Missing text="Added — no old image" />
            </LabeledStage>
          )}
          {hasNew ? (
            <LabeledStage label="New" width={stage.width} height={stage.height}>
              {newUrl !== undefined && !newImage.error ? (
                <StageImage src={newUrl} alt="New" width={stage.width} height={stage.height} />
              ) : (
                <Missing />
              )}
            </LabeledStage>
          ) : (
            <LabeledStage label="New" width={stage.width} height={stage.height}>
              <Missing text="Deleted — no new image" />
            </LabeledStage>
          )}
        </div>
      ) : null}
      {ready && mode === "slider" && both && oldUrl !== undefined && newUrl !== undefined ? (
        <WipeStage
          oldUrl={oldUrl}
          newUrl={newUrl}
          width={stage.width}
          height={stage.height}
          wipe={wipe}
          onWipe={setWipe}
        />
      ) : null}
      {ready && mode === "diff" && both && oldImage.element !== null && newImage.element !== null ? (
        <PixelStage
          oldImage={oldImage.element}
          newImage={newImage.element}
          naturalWidth={naturalWidth}
          naturalHeight={naturalHeight}
          width={stage.width}
          height={stage.height}
        />
      ) : null}
    </div>
  );
}

function ModeButton(props: { active: boolean; onClick: () => void; children: string; hint: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={props.active ? "secondary" : "ghost"}
          className="rounded-none border-0"
          aria-pressed={props.active}
          onClick={props.onClick}
        >
          {props.children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{props.hint}</TooltipContent>
    </Tooltip>
  );
}

function LabeledStage(props: { label: string; width: number; height: number; children: ReactNode; rule?: boolean }) {
  return (
    <figure className={cn("w-fit min-w-0", props.rule === true && "border-r border-border")}>
      <figcaption className="border-b border-border px-3 py-1 font-mono text-[11px] text-muted-foreground">{props.label}</figcaption>
      <StageFrame width={props.width} height={props.height}>
        {props.children}
      </StageFrame>
    </figure>
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
      className={cn("image-stage relative shrink-0 overflow-hidden", props.className)}
      style={{ width: props.width, height: props.height }}
      onPointerDown={props.onPointerDown}
      onPointerMove={props.onPointerMove}
    >
      {props.children}
    </div>
  );
}

function StageImage(props: { src: string; alt: string; width: number; height: number }) {
  return (
    <img
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      className="absolute top-0 left-0 max-w-none"
      style={{ width: props.width, height: props.height, objectFit: "contain", objectPosition: "left top" }}
    />
  );
}

function Missing(props: { text?: string }) {
  return (
    <p className="flex h-full items-center px-3 text-sm text-muted-foreground">{props.text ?? "Image missing"}</p>
  );
}

function WipeStage(props: {
  oldUrl: string;
  newUrl: string;
  width: number;
  height: number;
  wipe: number;
  onWipe: (value: number) => void;
}) {
  const { oldUrl, newUrl, width, height, wipe, onWipe } = props;
  const id = useId();
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

  return (
    <figure className="w-fit min-w-0">
      <StageFrame
        ref={frameRef}
        width={width}
        height={height}
        className="cursor-col-resize touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <StageImage src={oldUrl} alt="Old" width={width} height={height} />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${100 - wipe}%)` }}>
          <StageImage src={newUrl} alt="New" width={width} height={height} />
        </div>
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${wipe}%` }} aria-hidden>
          <span className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-primary" />
          <span className="absolute top-1/2 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-card" />
        </div>
      </StageFrame>
      <label className="flex w-full items-center gap-3 px-3 py-2 font-mono text-[11px] text-muted-foreground" htmlFor={id}>
        Old
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={wipe}
          aria-label="Wipe between old and new"
          className="min-w-0 flex-1 accent-primary"
          onChange={(event) => onWipe(Number(event.target.value))}
        />
        New
      </label>
    </figure>
  );
}

function PixelStage(props: {
  oldImage: HTMLImageElement;
  newImage: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  width: number;
  height: number;
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
    <figure className="w-fit min-w-0">
      <StageFrame width={props.width} height={props.height}>
        <canvas ref={canvasRef} className="block size-full" />
      </StageFrame>
      {stats !== null ? (
        <figcaption className="px-3 py-2 font-mono text-[11px] tabular-nums text-muted-foreground">
          {stats.changed.toLocaleString()} of {stats.total.toLocaleString()} pixels differ
        </figcaption>
      ) : null}
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
