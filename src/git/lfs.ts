import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { LFS_POINTER_VERSION } from "../schema/image.ts";
import { gitCommonDir } from "./repo.ts";

export type LfsPointer = {
  oid: string;
  size: number;
};

const POINTER_MAX = 1024;

export function parseLfsPointer(bytes: Uint8Array): LfsPointer | undefined {
  if (bytes.length === 0 || bytes.length > POINTER_MAX) {
    return undefined;
  }
  if (bytes.includes(0)) {
    return undefined;
  }
  const text = new TextDecoder("utf8").decode(bytes);
  if (!text.startsWith(`${LFS_POINTER_VERSION}\n`)) {
    return undefined;
  }
  const oid = /^oid sha256:([a-f0-9]{64})$/m.exec(text)?.[1];
  const sizeRaw = /^size (\d+)$/m.exec(text)?.[1];
  if (oid === undefined || sizeRaw === undefined) {
    return undefined;
  }
  return { oid, size: Number(sizeRaw) };
}

export function lfsObjectPath(gitCommonDir: string, oid: string): string {
  return join(gitCommonDir, "lfs", "objects", oid.slice(0, 2), oid.slice(2, 4), oid);
}

export async function readLfsObject(cwd: string, pointer: LfsPointer): Promise<Buffer | undefined> {
  const common = await gitCommonDir(cwd);
  const stored = lfsObjectPath(common, pointer.oid);
  if (!existsSync(stored)) {
    return undefined;
  }
  return readFile(stored);
}
