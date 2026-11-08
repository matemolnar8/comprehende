import { basename } from "../schema/types.ts";
import { parentDirs } from "./digest.ts";

/** A draft group past this many files splits by directory. */
export const MAX_CLUSTER_FILES = 8;

const MANIFEST_NAMES = new Set([
  "package.json",
  "Cargo.toml",
  "go.mod",
  "pyproject.toml",
  "setup.py",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "Gemfile",
  "composer.json",
  "mix.exs",
  "Package.swift",
]);

/** Files that make a directory hold several packages, so it splits like any directory. */
const WORKSPACE_NAMES = new Set(["pnpm-workspace.yaml", "lerna.json", "go.work", "rush.json"]);

function isManifestName(name: string): boolean {
  return MANIFEST_NAMES.has(name) || name.endsWith(".csproj");
}

/** Directories (`a/b/`) that hold a package manifest and no workspace file, from their entries. */
export function packageDirSet(entries: readonly string[]): Set<string> {
  const manifests = new Set<string>();
  const workspaces = new Set<string>();
  for (const path of entries) {
    const name = basename(path);
    const dir = path.slice(0, path.length - name.length);
    if (isManifestName(name)) {
      manifests.add(dir);
    } else if (WORKSPACE_NAMES.has(name)) {
      workspaces.add(dir);
    }
  }
  return new Set([...manifests].filter((dir) => !workspaces.has(dir)));
}

export type DirCluster = {
  /** `""` for the repo root, else ends in `/`. */
  dir: string;
  /** Only the files directly in `dir`: its subdirectories became clusters of their own. */
  direct: boolean;
  paths: string[];
};

/**
 * Split paths by directory while a cluster holds more than `max` files and spans more than one
 * child. A package directory never splits, so its code, tests, and config stay together; the
 * repo root always may. Clusters come in the order of their first path.
 */
export function dirClusters(
  paths: readonly string[],
  isPackageDir: (dir: string) => boolean,
  max = MAX_CLUSTER_FILES,
): DirCluster[] {
  const split = (dir: string, held: string[]): DirCluster[] => {
    if (held.length <= max || (dir !== "" && isPackageDir(dir))) {
      return [{ dir: commonDir(held), direct: false, paths: held }];
    }
    const direct: string[] = [];
    const children = new Map<string, string[]>();
    for (const path of held) {
      const slash = path.indexOf("/", dir.length);
      if (slash === -1) {
        direct.push(path);
        continue;
      }
      const child = path.slice(0, slash + 1);
      children.set(child, [...(children.get(child) ?? []), path]);
    }
    const [only] = children;
    if (direct.length === 0 && children.size === 1 && only !== undefined) {
      return split(only[0], only[1]);
    }
    if (children.size === 0) {
      return [{ dir, direct: false, paths: held }];
    }
    return [
      ...(direct.length > 0 ? [{ dir, direct: true, paths: direct }] : []),
      ...[...children].flatMap(([child, inside]) => split(child, inside)),
    ];
  };
  const order = new Map(paths.map((path, i) => [path, i]));
  const first = (cluster: DirCluster): number => order.get(cluster.paths[0] ?? "") ?? 0;
  return split("", [...paths]).sort((a, b) => first(a) - first(b));
}

function commonDir(paths: readonly string[]): string {
  const [head = ""] = paths;
  return parentDirs(head).findLast((dir) => paths.every((path) => path.startsWith(dir))) ?? "";
}

/** Group id slug: `dir-src-review`, or `dir-root` for the repo root. */
export function clusterId(cluster: DirCluster): string {
  const slug = cluster.dir
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `dir-${slug === "" ? "root" : slug}`;
}

export function clusterTitle(cluster: DirCluster): string {
  return cluster.dir === "" ? "Root files" : cluster.dir.slice(0, -1);
}

export function clusterWhy(cluster: DirCluster): string {
  const place =
    cluster.dir === ""
      ? "at the repo root"
      : `${cluster.direct ? "directly in" : "under"} ${cluster.dir.slice(0, -1)}`;
  return `Draft: changed files ${place}. Merge drafts that serve one concern; split one that holds two.`;
}
