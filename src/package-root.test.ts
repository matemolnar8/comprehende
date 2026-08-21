import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { findPackageRoot } from "./package-root.ts";

type PackageJson = {
  dependencies?: Record<string, string>;
  files?: string[];
};

describe("package root", () => {
  it("keeps UI libraries out of production dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(findPackageRoot(), "package.json"), "utf8")) as PackageJson;
    assert.deepEqual(pkg.dependencies ?? {}, {});
  });

  it("packs the published skill and not the next skill", () => {
    const pkg = JSON.parse(readFileSync(join(findPackageRoot(), "package.json"), "utf8")) as PackageJson;
    assert.deepEqual(pkg.files, ["dist", "skills"]);
  });
});
