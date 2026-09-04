import { basename } from "./types.ts";

export const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "avif", "ico"] as const;

const IMAGE_EXT = new Set<string>(IMAGE_EXTENSIONS);

export const LFS_POINTER_VERSION = "version https://git-lfs.github.com/spec/v1";

const MEDIA: Record<(typeof IMAGE_EXTENSIONS)[number], string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  avif: "image/avif",
  ico: "image/x-icon",
};

export function imageExtension(path: string): (typeof IMAGE_EXTENSIONS)[number] | undefined {
  const base = basename(path);
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    return undefined;
  }
  const ext = base.slice(dot + 1).toLowerCase();
  return IMAGE_EXT.has(ext) ? (ext as (typeof IMAGE_EXTENSIONS)[number]) : undefined;
}

export function isImagePath(path: string): boolean {
  return imageExtension(path) !== undefined;
}

export function imageMediaType(path: string): string {
  const ext = imageExtension(path);
  return ext === undefined ? "application/octet-stream" : MEDIA[ext];
}
