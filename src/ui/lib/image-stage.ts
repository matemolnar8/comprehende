export type ImageStageSize = {
  width: number;
  height: number;
  scale: number;
};

/** Whole steps keep each source pixel a crisp square, so only they render pixelated. */
export function crispScale(scale: number): boolean {
  return scale > 1 && Number.isInteger(scale);
}

/**
 * Fit an image into a box. A small image grows up to `maxScale`. From 2× up it grows by
 * whole steps only, so each source pixel stays a crisp square.
 */
export function fitImageStage(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maxScale = 1,
): ImageStageSize {
  if (naturalWidth <= 0 || naturalHeight <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    return { width: 0, height: 0, scale: 1 };
  }
  const fit = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
  const grown = Math.min(maxScale, fit);
  const scale = fit < 1 ? fit : grown >= 2 ? Math.floor(grown) : Math.max(1, grown);
  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
    scale,
  };
}

/** One pane of a two-column pair with `gap` pixels between the panes. */
export function fitTwoColumnStage(
  naturalWidth: number,
  naturalHeight: number,
  hostWidth: number,
  maxHeight: number,
  gap = 1,
  maxScale = 1,
): ImageStageSize {
  return fitImageStage(
    naturalWidth,
    naturalHeight,
    Math.floor(Math.max(0, hostWidth - gap) / 2),
    maxHeight,
    maxScale,
  );
}

/** Fit grows or shrinks the image to the card. Actual shows each source pixel as one CSS pixel. */
export type ImageZoom = "fit" | "actual";

export function stageScaleLabel(scale: number): string {
  if (Math.abs(scale - 1) < 0.005) {
    return "actual size";
  }
  return `shown at ${Math.round(scale * 100)}%`;
}
