import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { createExampleRepo } from "../test/example-repo.ts";
import { git } from "./exec.ts";
import { nameFromRemoteUrl, readRepoIdentity, stripRemoteCredentials } from "./repo.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("nameFromRemoteUrl", () => {
  it("reads the last path segment from https, ssh, and scp urls", () => {
    assert.equal(nameFromRemoteUrl("https://github.com/matemolnar8/comprehende.git"), "comprehende");
    assert.equal(nameFromRemoteUrl("git@github.com:matemolnar8/comprehende.git"), "comprehende");
    assert.equal(nameFromRemoteUrl("ssh://git@github.com/matemolnar8/comprehende.git"), "comprehende");
    assert.equal(nameFromRemoteUrl("/tmp/widgets.git"), "widgets");
  });

  it("rejects empty input", () => {
    assert.equal(nameFromRemoteUrl("  "), null);
  });
});

describe("stripRemoteCredentials", () => {
  it("removes userinfo from https remotes and leaves scp urls alone", () => {
    assert.equal(
      stripRemoteCredentials("https://x-access-token:secret@github.com/acme/widgets.git"),
      "https://github.com/acme/widgets.git",
    );
    assert.equal(
      stripRemoteCredentials("git@github.com:acme/widgets.git"),
      "git@github.com:acme/widgets.git",
    );
  });
});

describe("readRepoIdentity", () => {
  it("names the repo from origin when the remote exists", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-identity-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    await git(repo.root, ["remote", "add", "origin", "git@github.com:acme/widgets.git"]);
    const identity = await readRepoIdentity(repo.root);
    assert.equal(identity.name, "widgets");
    assert.match(identity.origin ?? "", /github\.com[:/]acme\/widgets(?:\.git)?$/);
    assert.doesNotMatch(identity.origin ?? "", /x-access-token|secret@/);
  });

  it("falls back to the repository directory name when origin is missing", async () => {
    const root = await mkdtemp(join(tmpdir(), "local-project-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const identity = await readRepoIdentity(repo.root);
    assert.equal(identity.origin, null);
    assert.equal(identity.name, basename(repo.root));
  });
});
