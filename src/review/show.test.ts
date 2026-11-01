import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { parseUnifiedDiff } from "../git/diff.ts";
import { numberedPatch } from "./show.ts";

describe("numberedPatch", () => {
  it("prints old and new numbers before each line and keeps git's no-newline marker", () => {
    const [file] = parseUnifiedDiff(
      [
        "diff --git a/a.txt b/a.txt",
        "--- a/a.txt",
        "+++ b/a.txt",
        "@@ -9,2 +9,2 @@ head",
        " keep",
        "-old",
        "\\ No newline at end of file",
        "+new",
        "\\ No newline at end of file",
        "",
      ].join("\n"),
    );
    assert.ok(file);
    assert.equal(
      numberedPatch(file, file.hunks),
      [
        "diff --git a/a.txt b/a.txt",
        "--- a/a.txt",
        "+++ b/a.txt",
        "@@ -9,2 +9,2 @@ head",
        " 9  9  keep",
        "10    -old",
        "      \\ No newline at end of file",
        "   10 +new",
        "      \\ No newline at end of file",
        "",
      ].join("\n"),
    );
  });
});
