import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { initialRailCollapsed } from "./file-nav.ts";

describe("initialRailCollapsed", () => {
  it("follows the rail query before a stored choice or the width", () => {
    assert.equal(initialRailCollapsed("?rail=collapsed", false, false), true);
    assert.equal(initialRailCollapsed("?other=1&rail=open", true, true), false);
  });

  it("uses a stored choice when the query is absent", () => {
    assert.equal(initialRailCollapsed("", false, true), false);
    assert.equal(initialRailCollapsed("?rail=side", true, false), true);
  });

  it("starts collapsed under the narrow rail width when nothing is stored", () => {
    assert.equal(initialRailCollapsed("", null, true), true);
    assert.equal(initialRailCollapsed("", null, false), false);
  });
});
