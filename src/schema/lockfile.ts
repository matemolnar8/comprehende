import { basename } from "./types.ts";

const LOCKFILE_NAMES = new Set([
  ".terraform.lock.hcl",
  "bun.lock",
  "bun.lockb",
  "cabal.project.freeze",
  "Cargo.lock",
  "Cartfile.resolved",
  "composer.lock",
  "conda-lock.yml",
  "deno.lock",
  "flake.lock",
  "Gemfile.lock",
  "go.sum",
  "go.work.sum",
  "Gopkg.lock",
  "gradle.lockfile",
  "lazy-lock.json",
  "mix.lock",
  "npm-shrinkwrap.json",
  "package-lock.json",
  "Package.resolved",
  "pdm.lock",
  "Pipfile.lock",
  "pixi.lock",
  "pnpm-lock.yaml",
  "Podfile.lock",
  "poetry.lock",
  "pubspec.lock",
  "renv.lock",
  "shrinkwrap.yaml",
  "stack.yaml.lock",
  "uv.lock",
  "yarn.lock",
]);

export function isLockfilePath(path: string): boolean {
  const base = basename(path);
  return LOCKFILE_NAMES.has(base) || base.endsWith(".gradle.lockfile");
}
