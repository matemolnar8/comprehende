import { readBlob } from "./blob.ts";
import { assertSafePath, assertSafeRef } from "./repo.ts";
import { gitOk } from "./exec.ts";

export async function showFile(cwd: string, ref: string, path: string): Promise<string> {
  const bytes = await readBlob(cwd, ref, path);
  return bytes.toString("utf8");
}

export async function fileExistsAt(cwd: string, ref: string, path: string): Promise<boolean> {
  assertSafeRef(ref);
  assertSafePath(path);
  return gitOk(cwd, ["cat-file", "-e", `${ref}:${path}`]);
}
