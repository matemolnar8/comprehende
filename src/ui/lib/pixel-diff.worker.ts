import { diffRgba } from "../../schema/image-diff.ts";

/** The image files as the page loaded them, so the worker does not fetch them again. */
export type PixelDiffInput = { oldImage: Blob; newImage: Blob; width: number; height: number };

export type PixelDiffResult = { bitmap: ImageBitmap; changed: number; total: number };

export type PixelDiffRequest = { id: number; input: PixelDiffInput };

/** Null result: an image did not decode. */
export type PixelDiffReply = { id: number; result: PixelDiffResult | null };

addEventListener("message", (event: MessageEvent<PixelDiffRequest>) => {
  void reply(event.data);
});

async function reply({ id, input }: PixelDiffRequest): Promise<void> {
  try {
    const result = await pixelDiff(input);
    const message: PixelDiffReply = { id, result };
    postMessage(message, { transfer: [result.bitmap] });
  } catch (cause: unknown) {
    console.error(cause);
    const message: PixelDiffReply = { id, result: null };
    postMessage(message);
  }
}

async function pixelDiff(input: PixelDiffInput): Promise<PixelDiffResult> {
  const { width, height } = input;
  const [oldPixels, newPixels] = await Promise.all([
    raster(input.oldImage, width, height),
    raster(input.newImage, width, height),
  ]);
  const diff = diffRgba(oldPixels, newPixels, width, height);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("no 2d context");
  }
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(diff.pixels);
  ctx.putImageData(imageData, 0, 0);
  return { bitmap: canvas.transferToImageBitmap(), changed: diff.changed, total: diff.total };
}

async function raster(file: Blob, width: number, height: number): Promise<Uint8ClampedArray> {
  const image = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (ctx === null) {
    image.close();
    throw new Error("no 2d context");
  }
  ctx.drawImage(image, 0, 0);
  image.close();
  return ctx.getImageData(0, 0, width, height).data;
}
