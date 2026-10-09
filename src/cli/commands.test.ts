import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, chmod, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { afterAll, describe, it } from "vite-plus/test";
import { cmdDigest, cmdIndex, cmdPregroup, cmdReview, cmdShow, cmdValidate } from "./commands.ts";
import { skeletonPaths } from "../review/skeleton.ts";
import { createExampleRepo, SECRET_ADD } from "../test/example-repo.ts";
import { createLockfileRepo, LOCKFILE_SECRET } from "../test/lockfile-repo.ts";

const REAL_GIT = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
const roots: string[] = [];

afterAll(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("cmdReview git work", { concurrent: false }, () => {
  it("pins the range once and writes a skeleton validate accepts", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-review-git-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "repo"));
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const dataPath = join(root, "out", "review.json");

    await withGitLog(join(root, "shim"), async (log) => {
      const { document, index: reviewed } = await cmdReview(repo.root, dataPath, repo.base, "main");
      const calls = await log.read();
      assert.deepEqual(tally(calls), {
        revParse: 2,
        nameStatus: 1,
        unified: 1,
        numstat: 0,
        mergeBase: 0,
        other: 0,
      });
      assert.deepEqual(
        calls.filter((argv) => gitCommand(argv) === "rev-parse").map((argv) => argv.at(-1)),
        [`${repo.base}^{commit}`, "main^{commit}"],
      );
      const unified = calls.find((argv) => gitCommand(argv) === "diff" && argv.includes("-U3"));
      assert.equal(
        unified?.find((arg) => arg.includes("...")),
        `${repo.base}...${repo.head}`,
      );
      assert.equal(document.source.baseRef, repo.base);
      assert.equal(document.source.headRef, "main");
      assert.equal(document.source.range, `${repo.base}...main`);
      assert.deepEqual(reviewed.hunks, index.hunks);
      assert.deepEqual(reviewed.skipped, index.skipped);
      assert.deepEqual(
        document.groups[0]?.hunkRefs,
        skeletonPaths(index).map((path) => ({ path })),
      );
      assert.ok(
        reviewed.skipped.some((item) => item.path === "assets/dot.bin" && item.reason === "binary"),
      );

      await log.clear();
      const validated = await cmdValidate(repo.root, dataPath);
      assert.deepEqual(validated.document, document);
      const validateCalls = tally(await log.read());
      assert.ok(validateCalls.unified >= 1);
      assert.ok(validateCalls.mergeBase >= 1);
    });
  });

  it("stubs lockfiles from one covering diff", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-review-lock-"));
    roots.push(root);
    const repo = await createLockfileRepo(join(root, "repo"));
    const dataPath = join(root, "review.json");

    await withGitLog(join(root, "shim"), async (log) => {
      const { document, index } = await cmdReview(repo.root, dataPath, repo.base, repo.head);
      assert.deepEqual(tally(await log.read()), {
        revParse: 2,
        nameStatus: 1,
        unified: 1,
        numstat: 1,
        mergeBase: 0,
        other: 0,
      });
      assert.equal(JSON.stringify(document).includes(LOCKFILE_SECRET), false);
      assert.equal(
        index.hunks.some((hunk) => hunk.path === "package-lock.json"),
        false,
      );
      assert.ok(
        index.skipped.some(
          (item) => item.path === "package-lock.json" && item.reason === "lockfile",
        ),
      );
      assert.ok(
        index.skipped.some(
          (item) => item.path === "apps/web/yarn.lock" && item.reason === "lockfile",
        ),
      );
      assert.ok(index.skipped.some((item) => item.path === "bun.lockb"));
      await cmdValidate(repo.root, dataPath);
    });
  });

  it("rejects an unsafe ref before git runs", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-review-unsafe-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "repo"));
    const dataPath = join(root, "review.json");

    await withGitLog(join(root, "shim"), async (log) => {
      await assert.rejects(
        () => cmdReview(repo.root, dataPath, "-evil", repo.head),
        /invalid git ref/,
      );
      assert.deepEqual(await log.read(), []);
      await assert.rejects(access(dataPath));
    });
  });

  it("digests one line per file with no patch text", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-digest-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "repo"));
    const text = await cmdDigest(repo.root, repo.base, repo.head);
    assert.match(text, /# Digest .* — \d+ files, \d+ hunks/);
    assert.match(text, /src\/app\.test\.ts.*test.*pairs with src\/app\.\*/);
    assert.match(text, /README\.md.*docs/);
    assert.match(text, /src\/helpers\.ts.*rename/);
    assert.equal(text.includes(SECRET_ADD), false);
  });

  it("shows one file or hunk patch on demand", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-show-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "repo"));
    const patch = await cmdShow(repo.root, repo.base, repo.head, { file: "src/types.ts" });
    assert.match(patch, /string \| number/);
    await assert.rejects(
      () => cmdShow(repo.root, repo.base, repo.head, { file: "nope.ts" }),
      /no diff for path/,
    );
    await assert.rejects(() => cmdShow(repo.root, repo.base, repo.head, {}), /--hunk/);
    await assert.rejects(
      () => cmdShow(repo.root, repo.base, repo.head, { hunk: "bogus" }),
      /invalid hunk ref|no diff for path/,
    );
  });

  it("pregroups a draft that validate accepts", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-pregroup-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "repo"));
    const dataPath = join(root, "review.json");
    const { document } = await cmdPregroup(repo.root, dataPath, repo.base, repo.head);
    assert.ok(document.groups.some((group) => group.id === "change"));
    assert.ok(document.groups.some((group) => group.id === "mechanical"));
    await cmdValidate(repo.root, dataPath);
  });
});

type GitLog = {
  read: () => Promise<string[][]>;
  clear: () => Promise<void>;
};

async function withGitLog(root: string, fn: (log: GitLog) => Promise<void>): Promise<void> {
  const bin = join(root, "bin");
  const logPath = join(root, "git.log");
  await mkdir(bin, { recursive: true });
  await writeFile(logPath, "");
  await writeFile(
    join(bin, "git"),
    `#!/bin/bash\nprintf '%s\\0' "$@" >> ${shellQuote(logPath)}\nprintf '\\n' >> ${shellQuote(logPath)}\nexec ${shellQuote(REAL_GIT)} "$@"\n`,
  );
  await chmod(join(bin, "git"), 0o755);
  const previousPath = process.env.PATH;
  process.env.PATH = `${bin}${delimiter}${previousPath ?? ""}`;
  try {
    await fn({
      read: async () => parseGitLog(await readFile(logPath, "utf8")),
      clear: () => writeFile(logPath, ""),
    });
  } finally {
    if (previousPath === undefined) {
      delete process.env.PATH;
    } else {
      process.env.PATH = previousPath;
    }
  }
}

function parseGitLog(text: string): string[][] {
  return text
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.split("\0").filter((arg) => arg.length > 0));
}

function gitCommand(argv: string[]): string | undefined {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-c") {
      i += 1;
      continue;
    }
    return arg;
  }
  return undefined;
}

function tally(calls: string[][]): {
  revParse: number;
  nameStatus: number;
  unified: number;
  numstat: number;
  mergeBase: number;
  other: number;
} {
  const counts = { revParse: 0, nameStatus: 0, unified: 0, numstat: 0, mergeBase: 0, other: 0 };
  for (const argv of calls) {
    const command = gitCommand(argv);
    if (command === "rev-parse") {
      counts.revParse += 1;
    } else if (command === "merge-base") {
      counts.mergeBase += 1;
    } else if (command === "diff" && argv.includes("--name-status")) {
      counts.nameStatus += 1;
    } else if (command === "diff" && argv.includes("--numstat")) {
      counts.numstat += 1;
    } else if (command === "diff") {
      counts.unified += 1;
    } else {
      counts.other += 1;
    }
  }
  return counts;
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
