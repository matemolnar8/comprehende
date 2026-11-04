import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { parseBlamePorcelain } from "./blame.ts";

const A = "a".repeat(40);
const B = "b".repeat(40);

describe("parseBlamePorcelain", () => {
  it("reads the sha, author, time and summary of each line", () => {
    const porcelain = [
      `${A} 1 1 2`,
      "author Ada",
      "author-mail <ada@example.com>",
      "author-time 1700000000",
      "summary Add the first lines",
      "filename a.ts",
      "\tone",
      `${A} 2 2`,
      "author Ada",
      "author-time 1700000000",
      "summary Add the first lines",
      "filename a.ts",
      "\ttwo",
      `${B} 1 3 1`,
      "author Ben",
      "author-time 1700000100",
      "summary summary of a fix",
      "previous 0000000000000000000000000000000000000000 a.ts",
      "filename a.ts",
      "\tsummary three",
      "",
    ].join("\n");
    assert.deepEqual(parseBlamePorcelain(porcelain), [
      {
        sha: A,
        author: "Ada",
        timestamp: 1700000000,
        summary: "Add the first lines",
        line: 1,
        text: "one",
      },
      {
        sha: A,
        author: "Ada",
        timestamp: 1700000000,
        summary: "Add the first lines",
        line: 2,
        text: "two",
      },
      {
        sha: B,
        author: "Ben",
        timestamp: 1700000100,
        summary: "summary of a fix",
        line: 3,
        text: "summary three",
      },
    ]);
  });
});
