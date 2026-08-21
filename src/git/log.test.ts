import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { git } from "./exec.ts";
import { listCommits } from "./log.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("listCommits", () => {
  it("keeps a multiline body and does not treat it as a second commit", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-log-"));
    roots.push(root);
    await mkdir(root, { recursive: true });
    await git(root, ["init", "-b", "main"]);
    await git(root, ["config", "user.email", "comprehende@example.com"]);
    await git(root, ["config", "user.name", "Comprehende Fixture"]);
    await git(root, ["config", "commit.gpgsign", "false"]);

    await writeFile(join(root, "a.txt"), "one\n", "utf8");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "base"]);
    const base = (await git(root, ["rev-parse", "HEAD"])).trim();

    await writeFile(join(root, "a.txt"), "two\n", "utf8");
    await git(root, ["add", "."]);
    await git(root, [
      "commit",
      "-m",
      "Fix the queue\n\nImport flooded MusicBrainz.\nRoute through the serial path instead.\n\nCo-authored-by: Máté Molnár <mate@example.com>",
    ]);
    const head = (await git(root, ["rev-parse", "HEAD"])).trim();

    const commits = await listCommits(root, base, head);
    assert.equal(commits.length, 1);
    assert.equal(commits[0]?.subject, "Fix the queue");
    assert.equal(
      commits[0]?.body,
      "Import flooded MusicBrainz.\nRoute through the serial path instead.\n\nCo-authored-by: Máté Molnár <mate@example.com>",
    );
    assert.equal(commits[0]?.sha, head);
    assert.ok((commits[0]?.shortSha.length ?? 0) >= 7);
  });

  it("returns an empty list when the range has no commits", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-log-empty-"));
    roots.push(root);
    await mkdir(root, { recursive: true });
    await git(root, ["init", "-b", "main"]);
    await git(root, ["config", "user.email", "comprehende@example.com"]);
    await git(root, ["config", "user.name", "Comprehende Fixture"]);
    await git(root, ["config", "commit.gpgsign", "false"]);
    await writeFile(join(root, "a.txt"), "one\n", "utf8");
    await git(root, ["add", "."]);
    await git(root, ["commit", "-m", "only"]);
    const sha = (await git(root, ["rev-parse", "HEAD"])).trim();
    assert.deepEqual(await listCommits(root, sha, sha), []);
  });
});
