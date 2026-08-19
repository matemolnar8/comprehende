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

/** One pane of a two-column pair, including a 1px divider. Never upscale. */
export function fitTwoColumnStage(
  naturalWidth: number,
  naturalHeight: number,
  hostWidth: number,
  maxHeight: number,
): ImageStageSize {
  return fitImageStage(naturalWidth, naturalHeight, Math.floor(Math.max(0, hostWidth - 1) / 2), maxHeight);
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
