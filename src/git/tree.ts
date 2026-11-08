import { git } from "./exec.ts";
import { assertSafePath, assertSafeRef } from "./repo.ts";

/** Full paths of the entries directly inside each directory (`a/b/`) at `ref`. */
export async function listDirEntries(
  cwd: string,
  ref: string,
  dirs: readonly string[],
): Promise<string[]> {
  assertSafeRef(ref);
  for (const dir of dirs) {
    assertSafePath(dir);
  }
  if (dirs.length === 0) {
    return [];
  }
  const stdout = await git(cwd, [
    "ls-tree",
    "--full-tree",
    "--name-only",
    "-z",
    "--end-of-options",
    ref,
    "--",
    ...dirs,
  ]);
  return stdout.split("\0").filter((path) => path.length > 0);
}
