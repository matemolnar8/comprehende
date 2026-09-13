import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { readPackageVersion } from "../package-root.ts";
import { parseArgv, DEFAULT_PORT } from "./args.ts";
import { isCliEntry, run } from "./main.ts";

describe("parseArgv", () => {
  it("parses serve flags", () => {
    const req = parseArgv(["serve", "--data", "review.json", "--port", "0", "--open"], "/repo");
    assert.deepEqual(req, {
      kind: "command",
      command: "serve",
      cwd: "/repo",
      base: undefined,
      head: undefined,
      data: "review.json",
      out: undefined,
      from: undefined,
      to: undefined,
      port: 0,
      open: true,
      json: false,
    });
  });

  it("parses export flags", () => {
    const req = parseArgv(["export", "--data", "review.json", "--out", "dist/review"], "/repo");
    assert.deepEqual(req, {
      kind: "command",
      command: "export",
      cwd: "/repo",
      base: undefined,
      head: undefined,
      data: "review.json",
      out: "dist/review",
      from: undefined,
      to: undefined,
      port: DEFAULT_PORT,
      open: false,
      json: false,
    });
  });

  it("parses compare flags", () => {
    const req = parseArgv(["compare", "--from", "old.json", "--to", "new.json", "--json"], "/repo");
    assert.deepEqual(req, {
      kind: "command",
      command: "compare",
      cwd: "/repo",
      base: undefined,
      head: undefined,
      data: undefined,
      out: undefined,
      from: "old.json",
      to: "new.json",
      port: DEFAULT_PORT,
      open: false,
      json: true,
    });
  });

  it("rejects unknown commands", () => {
    const req = parseArgv(["frobnicate"]);
    assert.equal(req.kind, "error");
  });
});

describe("run", () => {
  it("prints help and version", async () => {
    const log = console.log;
    const err = console.error;
    const lines: string[] = [];
    console.log = (message?: unknown) => {
      lines.push(String(message));
    };
    console.error = (message?: unknown) => {
      lines.push(String(message));
    };
    try {
      assert.equal(await run(["--help"]), 0);
      assert.equal(await run(["--version"]), 0);
      assert.equal(await run(["nope"]), 1);
      const text = lines.join("\n");
      assert.match(text, /Usage: comprehende/);
      assert.match(text, /export/);
      assert.match(text, /compare/);
      assert.ok(text.includes(readPackageVersion()));
      assert.match(text, /Unknown command: nope/);
    } finally {
      console.log = log;
      console.error = err;
    }
  });

  it("compares two review documents without git", async () => {
    const dir = await mkdtemp(join(tmpdir(), "comprehende-compare-cli-"));
    roots.push(dir);
    const fromPath = join(dir, "from.json");
    const toPath = join(dir, "to.json");
    await writeFile(fromPath, reviewJson("Cookie helper"));
    await writeFile(toPath, reviewJson("Session cookie"));
    const log = console.log;
    const err = console.error;
    const lines: string[] = [];
    console.log = (message?: unknown) => {
      lines.push(String(message));
    };
    console.error = (message?: unknown) => {
      lines.push(String(message));
    };
    try {
      assert.equal(await run(["compare", "--from", "from.json", "--to", "to.json"], dir), 0);
      const text = lines.join("\n");
      assert.match(text, /Interpretation/);
      assert.match(text, /Cookie helper/);
      assert.match(text, /Session cookie/);
      assert.equal(text.includes("diff --git"), false);
      assert.equal(await run(["compare", "--from", "from.json", "--to", "to.json", "--json"], dir), 0);
      const jsonLine = lines.find((line) => line.startsWith("{"));
      assert.ok(jsonLine);
      const parsed: unknown = JSON.parse(jsonLine);
      assert.ok(isRecord(parsed));
      assert.ok(isRecord(parsed.comparison));
      assert.equal(parsed.comparison.identical, false);
      assert.equal(await run(["compare", "--from", "from.json", "--json", "--open"], dir), 1);
      assert.match(lines.join("\n"), /--json or --open/);
      assert.equal(await run(["compare", "--to", "to.json"], dir), 1);
      assert.match(lines.join("\n"), /missing --from/);
    } finally {
      console.log = log;
      console.error = err;
    }
  });
});

describe("isCliEntry", () => {
  it("accepts the npm bin shim and the built file", () => {
    assert.equal(isCliEntry("/tmp/dist/cli/main.js", "/tmp/node_modules/.bin/comprehende"), true);
    assert.equal(isCliEntry("/tmp/dist/cli/main.js", "/tmp/dist/cli/main.js"), true);
    assert.equal(isCliEntry("/tmp/src/cli/main.ts", "/tmp/src/cli/main.ts"), true);
    assert.equal(isCliEntry("/tmp/dist/cli/main.js", "/tmp/src/cli/args.test.ts"), false);
    assert.equal(isCliEntry("/tmp/dist/cli/main.js", undefined), false);
  });
});

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

function reviewJson(title: string): string {
  return `${JSON.stringify(
    {
      version: 1,
      source: { baseRef: "main", headRef: "HEAD" },
      size: "small",
      title,
      summary: "A change.",
      groups: [
        {
          id: "g",
          title,
          why: "Why this group exists.",
          summary: "What this group is.",
          suggestedOrder: 0,
          hunkRefs: [{ path: "a.ts", oldStart: 1, oldLines: 1, newStart: 1, newLines: 2 }],
        },
      ],
    },
    null,
    2,
  )}\n`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
