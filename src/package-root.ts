import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function findPackageRoot(from = import.meta.url): string {
  let dir = dirname(fileURLToPath(from));
  for (;;) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      const pkg: unknown = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (isRecord(pkg) && pkg.name === "comprehende") {
        return dir;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error("could not find the comprehende package root");
    }
    dir = parent;
  }
}

export function readPackageVersion(): string {
  const pkgPath = join(findPackageRoot(), "package.json");
  return parsePackageVersion(readFileSync(pkgPath, "utf8"));
}

export function parsePackageVersion(text: string): string {
  const parsed: unknown = JSON.parse(text);
  if (!isRecord(parsed)) {
    throw new Error("package.json version must be a non-empty string");
  }
  const version = parsed.version;
  if (typeof version !== "string" || version === "") {
    throw new Error("package.json version must be a non-empty string");
  }
  return version;
}

export async function readPackageVersionFromDir(root: string): Promise<string> {
  return parsePackageVersion(await readFile(join(root, "package.json"), "utf8"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
