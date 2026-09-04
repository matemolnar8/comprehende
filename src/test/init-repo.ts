import { mkdir } from "node:fs/promises";
import { git } from "../git/exec.ts";

export async function initEmptyRepo(root: string): Promise<void> {
  await mkdir(root, { recursive: true });
  await git(root, ["init", "-b", "main"]);
  await git(root, ["config", "user.email", "comprehende@example.com"]);
  await git(root, ["config", "user.name", "Comprehende Fixture"]);
  await git(root, ["config", "commit.gpgsign", "false"]);
}
