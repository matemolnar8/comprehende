export type PixelDiff = {
  pixels: Uint8ClampedArray;
  changed: number;
  total: number;
};

const UNCHANGED_KEEP = 0.35;
const THRESHOLD = 8;

/** Paint a same-size RGBA pair. Unchanged pixels go gray; changed pixels go magenta. */
export function diffRgba(
  oldPixels: Uint8ClampedArray,
  newPixels: Uint8ClampedArray,
  width: number,
  height: number,
  threshold = THRESHOLD,
): PixelDiff {
  const total = width * height;
  const pixels = new Uint8ClampedArray(total * 4);
  let changed = 0;
  for (let i = 0; i < total; i += 1) {
    const o = i * 4;
    const oldA = oldPixels[o + 3] ?? 0;
    const newA = newPixels[o + 3] ?? 0;
    const empty = oldA === 0 && newA === 0;
    const dr = Math.abs((oldPixels[o] ?? 0) - (newPixels[o] ?? 0));
    const dg = Math.abs((oldPixels[o + 1] ?? 0) - (newPixels[o + 1] ?? 0));
    const db = Math.abs((oldPixels[o + 2] ?? 0) - (newPixels[o + 2] ?? 0));
    const da = Math.abs(oldA - newA);
    const delta = Math.max(dr, dg, db, da);
    if (empty || delta <= threshold) {
      const gray = grayOf(newPixels[o] ?? 0, newPixels[o + 1] ?? 0, newPixels[o + 2] ?? 0);
      const faded = Math.round(gray * UNCHANGED_KEEP);
      pixels[o] = faded;
      pixels[o + 1] = faded;
      pixels[o + 2] = faded;
      pixels[o + 3] = 255;
      continue;
    }
    changed += 1;
    if (oldA === 0 && newA > 0) {
      pixels[o] = 26;
      pixels[o + 1] = 127;
      pixels[o + 2] = 55;
      pixels[o + 3] = 255;
      continue;
    }
    if (newA === 0 && oldA > 0) {
      pixels[o] = 207;
      pixels[o + 1] = 34;
      pixels[o + 2] = 46;
      pixels[o + 3] = 255;
      continue;
    }
    pixels[o] = 200;
    pixels[o + 1] = 40;
    pixels[o + 2] = 160;
    pixels[o + 3] = 255;
  }
  return { pixels, changed, total };
}

function grayOf(r: number, g: number, b: number): number {
  return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
}
