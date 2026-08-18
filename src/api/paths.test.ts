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

  it("rejects path traversal", () => {
    assert.equal(parseApiPath("/api/files/new/../secret.json"), undefined);
  });
});
