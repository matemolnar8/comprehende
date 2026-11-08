import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { clusterId, clusterTitle, dirClusters, packageDirSet } from "./clusters.ts";

const summary = (clusters: ReturnType<typeof dirClusters>): string[] =>
  clusters.map((cluster) => `${clusterId(cluster)}:${cluster.paths.length}`);

const files = (dir: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `${dir}f${i}.ts`);

describe("dirClusters", () => {
  it("keeps up to the limit in one cluster at their common directory", () => {
    const clusters = dirClusters(files("src/lib/", 3), () => false, 3);
    assert.deepEqual(summary(clusters), ["dir-src-lib:3"]);
    const [first] = clusters;
    assert.ok(first);
    assert.equal(clusterTitle(first), "src/lib");
  });

  it("splits by the next segment, gives root files their own cluster, and keeps first-seen order", () => {
    const paths = ["README.md", ...files("src/ui/", 2), "package.json", ...files("src/api/", 2)];
    const clusters = dirClusters(paths, () => false, 3);
    assert.deepEqual(summary(clusters), ["dir-root:2", "dir-src-ui:2", "dir-src-api:2"]);
    const [first] = clusters;
    assert.ok(first);
    assert.equal(clusterTitle(first), "Root files");
  });

  it("splits deeper while a cluster is over the limit and never splits a package", () => {
    const paths = [
      ...files("packages/web/src/", 3),
      ...files("packages/web/test/", 3),
      ...files("tools/a/", 2),
      ...files("tools/b/", 2),
    ];
    const clusters = dirClusters(paths, (dir) => dir === "packages/web/", 3);
    assert.deepEqual(summary(clusters), ["dir-packages-web:6", "dir-tools-a:2", "dir-tools-b:2"]);
  });
});

describe("packageDirSet", () => {
  it("counts a manifest directory as one package unless it holds a workspace file", () => {
    const found = packageDirSet([
      "js/package.json",
      "js/pnpm-workspace.yaml",
      "js/packages/sdk/package.json",
      "crates/core/Cargo.toml",
      "apps/api/Api.csproj",
      "src/index.ts",
    ]);
    assert.deepEqual([...found].sort(), ["apps/api/", "crates/core/", "js/packages/sdk/"]);
  });
});
