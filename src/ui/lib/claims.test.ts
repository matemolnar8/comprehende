import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import type { ReviewDocument, Source } from "../../schema/types.ts";
import { openTargetForSource, reviewClaims } from "./claims.ts";

describe("reviewClaims", () => {
  it("lists document lookFor, then group attentions in part / dependsOn order", () => {
    const claims = reviewClaims(
      {
        lookFor: [
          "[#12](source:s1) also asks logout to clear the session cookie.",
          "Sessions issued before this change keep their old cookie.",
        ],
      },
      [
        {
          id: "login",
          part: "Session cookie",
          suggestedOrder: 0,
          dependsOn: ["cookie"],
          attention: { kind: "product", note: "[#12](source:s1) wants short sessions." },
        },
        {
          id: "cookie",
          part: "Session cookie",
          suggestedOrder: 1,
          attention: { kind: "contract", note: "`setSessionCookie` throws on `httpOnly: false`." },
        },
        { id: "docs", part: "README" },
      ],
    );
    assert.deepEqual(claims, [
      { key: "look-for:0", sourceIds: ["s1"] },
      { key: "look-for:1", sourceIds: [] },
      { key: "attention:cookie", groupId: "cookie", sourceIds: [] },
      { key: "attention:login", groupId: "login", sourceIds: ["s1"] },
    ]);
  });

  it("is empty without lookFor or attention", () => {
    assert.deepEqual(reviewClaims({}, [{ id: "docs" }]), []);
  });
});

describe("openTargetForSource", () => {
  const ticket: Source = { id: "s1", kind: "ticket", label: "#12" };
  const pin: Source = {
    id: "c1",
    kind: "pr-comment",
    label: "alice on PR #12",
    author: "alice",
    body: "Throws?",
    path: "src/auth/session.ts",
    side: "new",
    line: 4,
  };
  const document: ReviewDocument = {
    version: 1,
    source: { baseRef: "main", headRef: "HEAD" },
    size: "small",
    title: "HttpOnly session cookies",
    summary: "Cookie helper and login route.",
    sources: [ticket, pin],
    lookFor: ["[#12](source:s1) also asks logout to clear the session cookie."],
    groups: [
      {
        id: "cookie",
        title: "Session cookie helper",
        why: "The login route needs one helper.",
        summary: "`setSessionCookie` applies the options.",
        suggestedOrder: 0,
        sources: ["c1"],
        hunkRefs: [{ path: "src/auth/session.ts", oldStart: 1, newStart: 1 }],
      },
      {
        id: "login",
        title: "Login route",
        why: "[#12](source:s1) requires HttpOnly cookies.",
        summary: "The login route uses the helper.",
        suggestedOrder: 1,
        sources: ["s1"],
        hunkRefs: [{ path: "src/api/login.ts", oldStart: 10, newStart: 10 }],
      },
    ],
  };
  const claims = reviewClaims(document, document.groups);

  function withLoginAttention(base: ReviewDocument): ReviewDocument {
    return {
      ...base,
      groups: base.groups.map((group) =>
        group.id === "login"
          ? {
              ...group,
              attention: { kind: "product", note: "[#12](source:s1) wants HttpOnly cookies." },
            }
          : group,
      ),
    };
  }

  it("opens an old-side pin on the group whose directory ref holds the renamed file", () => {
    const old: Source = { ...pin, path: "e2e/a.png", side: "old", line: 1 };
    const moved: ReviewDocument = {
      ...document,
      sources: [old],
      groups: [
        ...document.groups,
        {
          id: "mechanical",
          title: "Moves",
          why: "w",
          summary: "s",
          suggestedOrder: 2,
          hunkRefs: [{ dir: "e2e/linux/" }],
        },
      ],
    };
    const renames = new Map([["e2e/a.png", "e2e/linux/a.png"]]);
    assert.deepEqual(openTargetForSource(old, [], moved, undefined, renames), {
      selection: { kind: "group", id: "mechanical" },
      commentId: "c1",
    });
  });

  it("opens a pin on the story group that names a file under a directory ref", () => {
    const moved: ReviewDocument = {
      ...document,
      groups: [
        {
          id: "mechanical",
          title: "Moves",
          why: "w",
          summary: "s",
          suggestedOrder: 2,
          hunkRefs: [{ dir: "src/" }],
        },
        ...document.groups,
      ],
    };
    assert.deepEqual(openTargetForSource(pin, [], moved), {
      selection: { kind: "group", id: "cookie" },
      commentId: "c1",
    });
  });

  it("opens a line pin on the group that covers the path", () => {
    assert.deepEqual(openTargetForSource(pin, claims, document), {
      selection: { kind: "group", id: "cookie" },
      commentId: "c1",
    });
  });

  it("stays on the current group when its attention and document lookFor both cite the source", () => {
    const withAttention = withLoginAttention(document);
    const nextClaims = reviewClaims(withAttention, withAttention.groups);
    assert.deepEqual(openTargetForSource(ticket, nextClaims, withAttention, "login"), {
      selection: { kind: "group", id: "login" },
      claimKey: "attention:login",
    });
  });

  it("opens document lookFor when no group cites or lists the source", () => {
    const only: Source = { id: "s-doc", kind: "ticket", label: "#99" };
    const withOnly = {
      ...document,
      sources: [...(document.sources ?? []), only],
      lookFor: [...(document.lookFor ?? []), "[#99](source:s-doc) is document-only work."],
    };
    const nextClaims = reviewClaims(withOnly, withOnly.groups);
    assert.deepEqual(openTargetForSource(only, nextClaims, withOnly), {
      selection: { kind: "overview" },
      claimKey: "look-for:1",
    });
  });

  it("opens a group attention before document lookFor", () => {
    const withAttention = withLoginAttention(document);
    const nextClaims = reviewClaims(withAttention, withAttention.groups);
    assert.deepEqual(openTargetForSource(ticket, nextClaims, withAttention), {
      selection: { kind: "group", id: "login" },
      claimKey: "attention:login",
    });
  });

  it("stays on the current group that lists the source without citing it", () => {
    assert.deepEqual(openTargetForSource(ticket, claims, document, "login"), {
      selection: { kind: "group", id: "login" },
    });
  });

  it("falls back to the group that lists the source", () => {
    const orphan: Source = { id: "s9", kind: "commit", label: "abc123" };
    const withCommit = {
      ...document,
      sources: [...(document.sources ?? []), orphan],
      groups: document.groups.map((group) =>
        group.id === "login" ? { ...group, sources: ["s1", "s9"] } : group,
      ),
    };
    assert.deepEqual(
      openTargetForSource(orphan, reviewClaims(withCommit, withCommit.groups), withCommit),
      {
        selection: { kind: "group", id: "login" },
      },
    );
  });

  it("falls back to overview when nothing owns the source", () => {
    const extra: Source = { id: "s8", kind: "transcript", label: "Cursor session" };
    assert.deepEqual(openTargetForSource(extra, claims, document), {
      selection: { kind: "overview" },
    });
  });
});
