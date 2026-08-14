import { assertSafePath, assertSafeRef } from "./repo.ts";
import { git } from "./exec.ts";

export async function showFile(cwd: string, ref: string, path: string): Promise<string> {
  assertSafeRef(ref);
  assertSafePath(path);
  return git(cwd, ["show", "--end-of-options", `${ref}:${path}`]);
}

export async function fileExistsAt(cwd: string, ref: string, path: string): Promise<boolean> {
  assertSafeRef(ref);
  assertSafePath(path);
  try {
    await git(cwd, ["cat-file", "-e", `${ref}:${path}`]);
    return true;
  } catch {
    return false;
  }
}
