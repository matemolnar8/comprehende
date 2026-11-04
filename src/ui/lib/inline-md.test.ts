import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { codeBreakParts } from "./inline-md.ts";

describe("codeBreakParts", () => {
  it("splits after each slash and dot and keeps the text identical", () => {
    const code = "src/ui/lib/inline-md.test.ts";
    const parts = codeBreakParts(code);
    assert.deepEqual(parts, ["src/", "ui/", "lib/", "inline-md.", "test.", "ts"]);
    assert.equal(parts.join(""), code);
  });

  it("does not add an empty part at either end", () => {
    assert.deepEqual(codeBreakParts("/etc/hosts."), ["/", "etc/", "hosts."]);
  });
});
