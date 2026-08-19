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
  const base = path.split("/").pop() ?? path;
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

export function isLfsPointerText(text: string): boolean {
  return text.includes(LFS_POINTER_VERSION) && /oid sha256:[a-f0-9]{64}/.test(text);
}

export function isImageHunkRef(ref: { oldStart: number; oldLines: number; newStart: number; newLines: number }): boolean {
  return ref.oldStart === 0 && ref.oldLines === 0 && ref.newStart === 0 && ref.newLines === 0;
}
