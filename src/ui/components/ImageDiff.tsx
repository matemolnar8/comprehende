import { useEffect, useId, useRef, useState } from "react";
import { resourceHref } from "../api.ts";
import { diffRgba } from "../../schema/image-diff.ts";
import { Button } from "@/components/ui/button.tsx";
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
  const [mode, setMode] = useState<ImageMode>("side-by-side");
  const [wipe, setWipe] = useState(50);
  const [oldError, setOldError] = useState<string | null>(null);
  const [newError, setNewError] = useState<string | null>(null);

  return (
    <div className="px-3 py-3">
      {both ? (
        <div className="mb-3 flex overflow-hidden rounded-md border border-input">
          <ModeButton active={mode === "side-by-side"} onClick={() => setMode("side-by-side")}>
            Side by side
          </ModeButton>
          <ModeButton active={mode === "slider"} onClick={() => setMode("slider")}>
            Slider
          </ModeButton>
          <ModeButton active={mode === "diff"} onClick={() => setMode("diff")}>
            Diff
          </ModeButton>
        </div>
      ) : null}
      {mode === "side-by-side" || !both ? (
        <div className={cn("grid gap-3", both ? "grid-cols-2" : "grid-cols-1")}>
          {hasOld ? (
            <ImagePane
              label="Old"
              src={oldUrl}
              onError={() => setOldError("Old image is missing. For Git LFS, fetch the object into this clone.")}
              error={oldError}
            />
          ) : (
            <EmptyPane label="Added — no old image" />
          )}
          {hasNew ? (
            <ImagePane
              label="New"
              src={newUrl}
              onError={() => setNewError("New image is missing. For Git LFS, fetch the object into this clone.")}
              error={newError}
            />
          ) : (
            <EmptyPane label="Deleted — no new image" />
          )}
        </div>
      ) : null}
      {mode === "slider" && both && oldUrl !== undefined && newUrl !== undefined ? (
        <SliderCompare oldUrl={oldUrl} newUrl={newUrl} wipe={wipe} onWipe={setWipe} />
      ) : null}
      {mode === "diff" && both && oldUrl !== undefined && newUrl !== undefined ? (
        <PixelCompare oldUrl={oldUrl} newUrl={newUrl} />
      ) : null}
    </div>
  );
}

function ModeButton(props: { active: boolean; onClick: () => void; children: string }) {
  return (
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
  );
}

function ImagePane(props: { label: string; src?: string; error: string | null; onError: () => void }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1 font-mono text-[11px] text-muted-foreground">{props.label}</figcaption>
      {props.error !== null ? <p className="text-sm text-warn">{props.error}</p> : null}
      {props.src !== undefined && props.error === null ? (
        <img
          src={props.src}
          alt={props.label}
          className="max-h-[70vh] w-full rounded-md border border-border bg-[var(--diff-canvas)] object-contain"
          onError={props.onError}
        />
      ) : null}
    </figure>
  );
}

function EmptyPane(props: { label: string }) {
  return <p className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">{props.label}</p>;
}

function SliderCompare(props: { oldUrl: string; newUrl: string; wipe: number; onWipe: (value: number) => void }) {
  const { oldUrl, newUrl, wipe, onWipe } = props;
  const id = useId();
  return (
    <figure className="min-w-0">
      <div className="relative overflow-hidden rounded-md border border-border bg-[var(--diff-canvas)]">
        <img src={oldUrl} alt="Old" className="block max-h-[70vh] w-full object-contain" />
        <img
          src={newUrl}
          alt="New"
          className="absolute inset-0 max-h-[70vh] w-full object-contain"
          style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-primary"
          style={{ left: `${wipe}%` }}
          aria-hidden
        />
      </div>
      <label className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground" htmlFor={id}>
        Old
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={wipe}
          className="min-w-0 flex-1 accent-primary"
          onChange={(event) => onWipe(Number(event.target.value))}
        />
        New
      </label>
    </figure>
  );
}

function PixelCompare(props: { oldUrl: string; newUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<{ changed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setStats(null);
    void (async () => {
      try {
        const [oldImg, newImg] = await Promise.all([loadImage(props.oldUrl), loadImage(props.newUrl)]);
        if (cancelled) {
          return;
        }
        const width = Math.max(oldImg.naturalWidth, newImg.naturalWidth);
        const height = Math.max(oldImg.naturalHeight, newImg.naturalHeight);
        const oldPixels = raster(oldImg, width, height);
        const newPixels = raster(newImg, width, height);
        const diff = diffRgba(oldPixels, newPixels, width, height);
        const canvas = canvasRef.current;
        if (canvas === null) {
          return;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx === null) {
          return;
        }
        const imageData = ctx.createImageData(width, height);
        imageData.data.set(diff.pixels);
        ctx.putImageData(imageData, 0, 0);
        setStats({ changed: diff.changed, total: diff.total });
      } catch {
        if (!cancelled) {
          setError("Could not compare images. For Git LFS, fetch the object into this clone.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.newUrl, props.oldUrl]);

  return (
    <figure className="min-w-0">
      {error !== null ? <p className="text-sm text-warn">{error}</p> : null}
      <canvas
        ref={canvasRef}
        className="max-h-[70vh] max-w-full rounded-md border border-border bg-[var(--diff-canvas)]"
      />
      {stats !== null ? (
        <figcaption className="mt-2 font-mono text-[11px] text-muted-foreground">
          {stats.changed.toLocaleString()} of {stats.total.toLocaleString()} pixels differ
        </figcaption>
      ) : null}
    </figure>
  );
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
