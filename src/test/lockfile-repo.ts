import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { git } from "../git/exec.ts";
import type { ExampleRepo } from "./example-repo.ts";

export const LOCKFILE_SECRET = "LOCKFILE_SECRET_LINE_a8f2";
export const APP_SECRET = "APP_SECRET_LINE_b4c1";

export async function createLockfileRepo(root: string): Promise<ExampleRepo> {
  await mkdir(root, { recursive: true });
  await git(root, ["init", "-b", "main"]);
  await git(root, ["config", "user.email", "comprehende@example.com"]);
  await git(root, ["config", "user.name", "Comprehende Fixture"]);
  await git(root, ["config", "commit.gpgsign", "false"]);
  await mkdir(join(root, "src"), { recursive: true });
  await mkdir(join(root, "apps/web"), { recursive: true });

  await writeFile(join(root, "src/app.ts"), 'export const name = "alpha";\n', "utf8");
  await writeFile(join(root, "package-lock.json"), lockfile("1"), "utf8");
  await writeFile(join(root, "apps/web/yarn.lock"), "old-yarn\n", "utf8");
  await writeFile(join(root, "bun.lockb"), Buffer.from([0x00, 0x01, 0xff]));

  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "Base with lockfiles"]);
  const base = (await git(root, ["rev-parse", "HEAD"])).trim();

  await writeFile(join(root, "src/app.ts"), `export const name = "${APP_SECRET}";\n`, "utf8");
  await writeFile(join(root, "package-lock.json"), lockfile("2"), "utf8");
  await writeFile(join(root, "apps/web/yarn.lock"), "new-yarn\n", "utf8");
  await writeFile(join(root, "bun.lockb"), Buffer.from([0x00, 0x01, 0xfe]));

  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Bump app and lockfiles"]);
  const head = (await git(root, ["rev-parse", "HEAD"])).trim();
  return { root, base, head };
}

function lockfile(version: string): string {
  return [
    "{",
    `  "name": "fixture",`,
    `  "version": "${version}",`,
    `  "marker": "${LOCKFILE_SECRET}",`,
    `  "packages": {`,
    `    "": { "version": "${version}" }`,
    `  }`,
    "}",
    "",
  ].join("\n");
}
