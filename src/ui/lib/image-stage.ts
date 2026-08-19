export type ImageStageSize = {
  width: number;
  height: number;
  scale: number;
};

/** Fit an image into a box. Never upscale. */
export function fitImageStage(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number,
): ImageStageSize {
  if (naturalWidth <= 0 || naturalHeight <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    return { width: 0, height: 0, scale: 1 };
  }
  const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
    scale,
  };
}

export function stageCaption(naturalWidth: number, naturalHeight: number, scale: number): string {
  const pixels = `${naturalWidth} × ${naturalHeight}`;
  if (scale >= 0.995) {
    return pixels;
  }
  return `${pixels} at ${Math.round(scale * 100)}%`;
}

/** New image overlay width. 0 = all old, 100 = all new, revealed from the left. */
export function wipeOverlayWidth(wipe: number): string {
  return `${wipe}%`;
}
