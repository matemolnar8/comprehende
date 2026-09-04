import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { git } from "../git/exec.ts";
import { lfsObjectPath } from "../git/lfs.ts";
import type { ExampleRepo } from "./example-repo.ts";
import { initEmptyRepo } from "./init-repo.ts";
import { encodePng } from "./png.ts";

export type ImageRepo = ExampleRepo & {
  shotOld: Buffer;
  shotNew: Buffer;
  lfsOld: Buffer;
  lfsNew: Buffer;
};

export async function createImageRepo(root: string): Promise<ImageRepo> {
  await initEmptyRepo(root);
  await mkdir(join(root, "assets"), { recursive: true });
  await mkdir(join(root, "shots"), { recursive: true });

  const shotOld = screenshotPng("old");
  const shotNew = screenshotPng("new");
  const lfsOld = screenshotPng("lfs-old");
  const lfsNew = screenshotPng("lfs-new");

  await writeFile(join(root, "assets/shot.png"), shotOld);
  await writeFile(join(root, "shots/home.png"), lfsPointer(lfsOld));
  await writeLfsObject(root, lfsOld);
  await writeFile(join(root, "assets/dot.bin"), Buffer.from([0x00, 0x01, 0xff]));
  await writeFile(join(root, "README.md"), "# shots\n");

  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", "Base screenshots"]);
  const base = (await git(root, ["rev-parse", "HEAD"])).trim();

  await writeFile(join(root, "assets/shot.png"), shotNew);
  await writeFile(join(root, "shots/home.png"), lfsPointer(lfsNew));
  await writeLfsObject(root, lfsNew);
  await writeFile(join(root, "assets/dot.bin"), Buffer.from([0x00, 0x01, 0xfe]));
  await writeFile(join(root, "README.md"), "# shots\n\nHead.\n");

  await git(root, ["add", "-A"]);
  await git(root, ["commit", "-m", "Update screenshots"]);
  const head = (await git(root, ["rev-parse", "HEAD"])).trim();
  return { root, base, head, shotOld, shotNew, lfsOld, lfsNew };
}

export function screenshotPng(variant: "old" | "new" | "lfs-old" | "lfs-new"): Buffer {
  const width = 320;
  const height = 180;
  const accent: readonly [number, number, number] = variant.endsWith("new") ? [61, 79, 216] : [26, 127, 55];
  return encodePng(width, height, (x, y) => {
    if (y < 28) {
      return [24, 28, 36, 255];
    }
    if (x < 64) {
      return [36, 42, 54, 255];
    }
    if (x >= 200 && x < 248 && y >= 70 && y < 118) {
      return [accent[0], accent[1], accent[2], 255];
    }
    if (variant.startsWith("lfs") && x >= 80 && x < 140 && y >= 120 && y < 150) {
      return variant.endsWith("new") ? [207, 34, 46, 255] : [90, 96, 108, 255];
    }
    return [244, 246, 248, 255];
  });
}

function lfsPointer(bytes: Buffer): string {
  const oid = createHash("sha256").update(bytes).digest("hex");
  return `version https://git-lfs.github.com/spec/v1\noid sha256:${oid}\nsize ${bytes.length}\n`;
}

async function writeLfsObject(repo: string, bytes: Buffer): Promise<void> {
  const oid = createHash("sha256").update(bytes).digest("hex");
  const path = lfsObjectPath(join(repo, ".git"), oid);
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, bytes);
}
