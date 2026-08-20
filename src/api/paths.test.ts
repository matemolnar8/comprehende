import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { apiFsRel, apiHref, parseApiPath, type ApiResource } from "./paths.ts";

describe("api paths", () => {
  it("round-trips review, hunks, and nested file paths", () => {
    const resources: ApiResource[] = [
      { kind: "review" },
      { kind: "hunks", group: "unassigned" },
      { kind: "hunks", group: "all" },
      { kind: "file", path: "src/app.ts", side: "new" },
      { kind: "blame", path: "src/helpers.ts", side: "old" },
      { kind: "file", path: "weird name/foo.ts", side: "new" },
      { kind: "image", path: "shots/home.png", side: "old" },
      { kind: "patch", path: "package-lock.json" },
      { kind: "patch", path: "apps/web/pnpm-lock.yaml" },
    ];
    for (const resource of resources) {
      assert.deepEqual(parseApiPath(`/${apiHref(resource)}`), resource);
    }
  });

  it("writes decoded file paths so static hosts can map %20 to a space", () => {
    const resource = { kind: "file", path: "weird name/foo.ts", side: "new" } as const;
    assert.equal(apiHref(resource), "api/files/new/weird%20name/foo.ts.json");
    assert.equal(apiFsRel(resource), "api/files/new/weird name/foo.ts.json");
  });

  it("writes image bytes without a json suffix", () => {
    const resource = { kind: "image", path: "shots/home.png", side: "new" } as const;
    assert.equal(apiHref(resource), "api/images/new/shots/home.png");
    assert.equal(apiFsRel(resource), "api/images/new/shots/home.png");
    assert.deepEqual(parseApiPath("/api/images/new/shots/home.png"), resource);
  });

  it("writes lockfile patches with a json suffix", () => {
    const resource = { kind: "patch", path: "package-lock.json" } as const;
    assert.equal(apiHref(resource), "api/patches/package-lock.json.json");
    assert.equal(apiFsRel(resource), "api/patches/package-lock.json.json");
    assert.deepEqual(parseApiPath("/api/patches/package-lock.json.json"), resource);
  });

  it("rejects path traversal", () => {
    assert.equal(parseApiPath("/api/files/new/../secret.json"), undefined);
  });
});
