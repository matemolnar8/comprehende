import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import type { ReviewDocument, ReviewGroup } from "../schema/types.ts";
import { changesPayload } from "./changes.ts";

function group(id: string, extra: Partial<ReviewGroup> = {}): ReviewGroup {
  return {
    id,
    title: id,
    why: "Why.",
    summary: "Summary.",
    suggestedOrder: 0,
    hunkRefs: [{ path: `${id}.ts` }],
    ...extra,
  };
}

function document(extra: Partial<ReviewDocument>): ReviewDocument {
  return {
    version: 1,
    size: "small",
    source: { baseRef: "main", headRef: "feat", baseSha: "a".repeat(40), headSha: "b".repeat(40) },
    title: "Change",
    summary: "What.",
    groups: [],
    ...extra,
  };
}

describe("changesPayload", () => {
  it("lists the prose, bullets, sources, and groups that differ", () => {
    const previous = document({
      lookFor: ["Old claim."],
      sources: [{ id: "pr", kind: "pr", label: "#1" }],
      groups: [
        group("same"),
        group("auth", { summary: "Uses a token.", lookFor: ["Token expiry."] }),
        group("cache"),
      ],
    });
    const current = document({
      summary: "What, now.",
      lookFor: ["Old claim.", "New claim."],
      sources: [{ id: "ticket", kind: "ticket", label: "#2" }],
      groups: [
        group("same"),
        group("auth", { summary: "Uses a cookie.", lookFor: ["Cookie flags."] }),
        group("retry", { suggestedOrder: 1 }),
      ],
    });

    const changes = changesPayload(previous, current, undefined);

    assert.deepEqual(changes.since, { baseSha: "a".repeat(40), headSha: "b".repeat(40) });
    assert.deepEqual(changes.text, { summary: { before: "What.", after: "What, now." } });
    assert.deepEqual(changes.lookFor, { added: ["New claim."], removed: [] });
    assert.deepEqual(changes.sources, { added: ["#2"], removed: ["#1"] });
    assert.equal(changes.hunks, undefined);
    assert.deepEqual(
      changes.groups.map((item) => [item.id, item.state]),
      [
        ["auth", "kept"],
        ["retry", "added"],
        ["cache", "removed"],
      ],
    );
    const auth = changes.groups[0];
    assert.deepEqual(auth?.text, { summary: { before: "Uses a token.", after: "Uses a cookie." } });
    assert.deepEqual(auth?.lookFor, { added: ["Cookie flags."], removed: ["Token expiry."] });
  });
});
