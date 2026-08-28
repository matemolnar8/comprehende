import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  commonDirname,
  isPeekStyle,
  peekFiles,
  peekLabels,
  relativeToDir,
  uniqueFileLabel,
} from "./peek-files.ts";

describe("peekFiles", () => {
  it("keeps four or fewer paths so the remainder is never 1", () => {
    assert.deepEqual(peekFiles(["a", "b", "c", "d"]), { shown: ["a", "b", "c", "d"], rest: 0 });
    assert.deepEqual(peekFiles(["a"]), { shown: ["a"], rest: 0 });
  });

  it("caps at three and counts the rest once there are five", () => {
    assert.deepEqual(peekFiles(["a", "b", "c", "d", "e"]), { shown: ["a", "b", "c"], rest: 2 });
  });
});

describe("commonDirname", () => {
  it("returns empty when paths do not share a directory", () => {
    assert.equal(commonDirname([]), "");
    assert.equal(commonDirname(["README.md", "src/app.ts"]), "");
    assert.equal(commonDirname(["src/app.ts", "scripts/run.ts"]), "");
  });

  it("uses the directory of a single path", () => {
    assert.equal(commonDirname(["src/api/live.ts"]), "src/api");
    assert.equal(commonDirname(["README.md"]), "");
  });

  it("returns the longest shared directory", () => {
    assert.equal(commonDirname(["src/api/live.ts", "src/api/paths.ts", "src/api/agent-md.ts"]), "src/api");
    assert.equal(commonDirname(["src/schema/types.ts", "src/ui/App.tsx"]), "src");
  });
});

describe("uniqueFileLabel", () => {
  it("uses the basename when it is unique in the group", () => {
    assert.equal(uniqueFileLabel("src/api/live.ts", ["src/api/live.ts", "src/api/paths.ts"]), "live.ts");
  });

  it("grows the suffix until the label is unique", () => {
    const all = ["src/schema/types.ts", "src/ui/types.ts"];
    assert.equal(uniqueFileLabel("src/schema/types.ts", all), "schema/types.ts");
    assert.equal(uniqueFileLabel("src/ui/types.ts", all), "ui/types.ts");
  });
});

describe("relativeToDir", () => {
  it("strips the directory prefix", () => {
    assert.equal(relativeToDir("src/api/live.ts", "src/api"), "live.ts");
    assert.equal(relativeToDir("src/schema/types.ts", "src"), "schema/types.ts");
    assert.equal(relativeToDir("README.md", ""), "README.md");
  });
});

describe("peekLabels", () => {
  const mixed = [
    "src/api/agent-md.ts",
    "src/api/live.ts",
    "src/api/paths.ts",
    "src/api/paths.test.ts",
    "scripts/pack-smoke.ts",
  ];
  const schema = ["src/schema/types.ts", "src/schema/parse.ts", "src/schema/review.schema.json"];

  it("stack and line use basenames and no folder", () => {
    assert.deepEqual(peekLabels(mixed, "stack"), {
      dir: "",
      labels: ["agent-md.ts", "live.ts", "paths.ts"],
      rest: 2,
    });
    assert.deepEqual(peekLabels(mixed, "line"), {
      dir: "",
      labels: ["agent-md.ts", "live.ts", "paths.ts"],
      rest: 2,
    });
  });

  it("fold shows the shared folder when the whole group lives there", () => {
    assert.deepEqual(peekLabels(schema, "fold"), {
      dir: "src/schema",
      labels: ["types.ts", "parse.ts", "review.schema.json"],
      rest: 0,
    });
  });

  it("fold uses unique suffixes when files sit in different trees", () => {
    assert.deepEqual(peekLabels(mixed, "fold"), {
      dir: "",
      labels: ["agent-md.ts", "live.ts", "paths.ts"],
      rest: 2,
    });
    assert.deepEqual(peekLabels(["src/schema/types.ts", "src/ui/types.ts"], "fold"), {
      dir: "src",
      labels: ["schema/types.ts", "ui/types.ts"],
      rest: 0,
    });
  });
});

describe("isPeekStyle", () => {
  it("accepts the three peek names", () => {
    assert.equal(isPeekStyle("stack"), true);
    assert.equal(isPeekStyle("line"), true);
    assert.equal(isPeekStyle("fold"), true);
    assert.equal(isPeekStyle("names"), false);
    assert.equal(isPeekStyle(null), false);
  });
});
