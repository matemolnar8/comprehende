import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseViewed, serializeViewed, setPathViewed, viewedStorageKey } from "./viewed-files.ts";

describe("viewed files", () => {
  it("keys storage by the resolved review range", () => {
    assert.equal(viewedStorageKey("aaa", "bbb"), "comprehende.viewed.aaa.bbb");
  });

  it("round-trips paths", () => {
    const paths = new Set(["src/b.ts", "src/a.ts"]);
    assert.deepEqual([...parseViewed(serializeViewed(paths))].sort(), ["src/a.ts", "src/b.ts"]);
  });

  it("treats missing or invalid payloads as empty", () => {
    assert.equal(parseViewed(null).size, 0);
    assert.equal(parseViewed("").size, 0);
    assert.equal(parseViewed("{").size, 0);
    assert.equal(parseViewed("{\"path\":true}").size, 0);
    assert.equal(parseViewed("[1]").size, 0);
  });

  it("adds and removes a path without mutating the original set", () => {
    const original = new Set(["src/a.ts"]);
    const added = setPathViewed(original, "src/b.ts", true);
    const removed = setPathViewed(original, "src/a.ts", false);
    assert.deepEqual([...original], ["src/a.ts"]);
    assert.equal(added.has("src/a.ts"), true);
    assert.equal(added.has("src/b.ts"), true);
    assert.equal(removed.has("src/a.ts"), false);
  });
});
