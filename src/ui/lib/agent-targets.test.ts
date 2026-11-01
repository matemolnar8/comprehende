import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { AGENT_TARGET_IDS, agentLink, repoSlug } from "./agent-targets.ts";

const prompt =
  "Answer the following questions by using https://x.test/a.md: Why & how?\nNext + more";
const local = { origin: "git@github.com:acme/widgets.git", root: "/home/me/widgets wt" };
const hosted = { origin: "https://github.com/acme/widgets", root: null };

function params(link: string | null): Record<string, string> {
  assert.ok(link !== null);
  return Object.fromEntries(new URL(link).searchParams);
}

describe("agentLink", () => {
  it("copy has no link", () => {
    assert.equal(agentLink("copy", prompt, local), null);
  });

  it("keeps the whole prompt for every app, with & + and new lines", () => {
    for (const id of AGENT_TARGET_IDS) {
      const link = agentLink(id, prompt, local);
      if (link === null) {
        continue;
      }
      assert.ok(Object.values(params(link)).includes(prompt), id);
      assert.doesNotMatch(link, /[ +\n]/, id);
    }
  });

  it("opens Claude Code in the local work tree, else in the clone of the origin", () => {
    assert.deepEqual(params(agentLink("claude", prompt, local)), {
      q: prompt,
      cwd: "/home/me/widgets wt",
    });
    assert.deepEqual(params(agentLink("claude", prompt, hosted)), {
      q: prompt,
      repo: "acme/widgets",
    });
    assert.deepEqual(params(agentLink("claude", prompt, { origin: null, root: null })), {
      q: prompt,
    });
  });

  it("gives Codex the path only when there is one", () => {
    assert.equal(params(agentLink("codex", prompt, local)).path, "/home/me/widgets wt");
    assert.equal(params(agentLink("codex", prompt, hosted)).path, undefined);
  });
});

describe("repoSlug", () => {
  it("reads owner/name from ssh and https remotes", () => {
    assert.equal(repoSlug("git@github.com:acme/widgets.git"), "acme/widgets");
    assert.equal(repoSlug("https://github.com/acme/widgets/"), "acme/widgets");
    assert.equal(repoSlug("ssh://git@host:2222/acme/widgets.git"), "acme/widgets");
    assert.equal(repoSlug(null), null);
  });
});
