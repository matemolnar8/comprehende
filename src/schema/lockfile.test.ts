import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isLockfilePath } from "./lockfile.ts";

describe("isLockfilePath", () => {
  it("matches lockfile basenames in any directory", () => {
    assert.equal(isLockfilePath("package-lock.json"), true);
    assert.equal(isLockfilePath("apps/web/pnpm-lock.yaml"), true);
    assert.equal(isLockfilePath("crates/foo/Cargo.lock"), true);
    assert.equal(isLockfilePath("go.sum"), true);
    assert.equal(isLockfilePath("lib/foo.gradle.lockfile"), true);
    assert.equal(isLockfilePath("src/app.ts"), false);
    assert.equal(isLockfilePath("lock.json"), false);
    assert.equal(isLockfilePath("package.json"), false);
  });
});
