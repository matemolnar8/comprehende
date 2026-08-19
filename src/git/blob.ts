import { imageMediaType } from "../schema/image.ts";
import { gitBuffer } from "./exec.ts";
import { parseLfsPointer, readLfsObject } from "./lfs.ts";
import { assertSafePath, assertSafeRef } from "./repo.ts";

export type ImageBlob =
  | { ok: true; bytes: Buffer; mediaType: string; lfs: boolean }
  | { ok: false; oid: string };

export async function readBlob(cwd: string, ref: string, path: string): Promise<Buffer> {
  assertSafeRef(ref);
  assertSafePath(path);
  return gitBuffer(cwd, ["cat-file", "blob", `${ref}:${path}`]);
}

export async function readImageBlob(cwd: string, ref: string, path: string): Promise<ImageBlob> {
  const blob = await readBlob(cwd, ref, path);
  const pointer = parseLfsPointer(blob);
  if (pointer === undefined) {
    return { ok: true, bytes: blob, mediaType: imageMediaType(path), lfs: false };
  }
  const object = await readLfsObject(cwd, pointer);
  if (object === undefined) {
    return { ok: false, oid: pointer.oid };
  }
  return { ok: true, bytes: object, mediaType: imageMediaType(path), lfs: true };
}
