import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WAIT_REVEAL_MS, waitVisible } from "./wait.ts";

describe("waitVisible", () => {
  it("shows only for an active request past the delay", () => {
    const cases: Array<[active: boolean, elapsed: number, delay: number | undefined, expected: boolean]> = [
      [true, 0, undefined, false],
      [true, WAIT_REVEAL_MS - 1, undefined, false],
      [true, WAIT_REVEAL_MS, undefined, true],
      [false, WAIT_REVEAL_MS, undefined, false],
      [false, 0, 0, false],
      [true, 0, 0, true],
    ];
    for (const [active, elapsed, delay, expected] of cases) {
      assert.equal(
        delay === undefined ? waitVisible(active, elapsed) : waitVisible(active, elapsed, delay),
        expected,
      );
    }
  });
});
