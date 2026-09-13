import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ReviewDocument, Source } from "../../schema/types.ts";
import {
  claimsFromLookFor,
  lookForClaims,
  lookForKey,
  lookForOwnerLabel,
  openTargetForSource,
  parseLookForBullet,
  selectionForLookFor,
} from "./look-for.ts";

const cookie = {
  id: "cookie",
  title: "Session cookie helper",
  lookFor: ["Breaking. `setSessionCookie` throws when the caller passes `httpOnly: false`."],
  part: "Session cookie",
};

const login = {
  id: "login",
  title: "Login route",
  lookFor: ["For `rememberMe = false`, compare the cookie: old code permits script access."],
  part: "Session cookie",
};

const docs = {
  id: "docs",
  title: "README wording",
  part: "README",
};

describe("parseLookForBullet", () => {
  it("reads the four risk tags and leaves the sentence", () => {
    assert.deepEqual(parseLookForBullet("Breaking. Throws when httpOnly is false."), {
      tag: "Breaking",
      body: "Throws when httpOnly is false.",
    });
    assert.deepEqual(parseLookForBullet("Subtle. [#12](source:s1) wants HttpOnly cookies."), {
      tag: "Subtle",
      body: "[#12](source:s1) wants HttpOnly cookies.",
    });
    assert.deepEqual(parseLookForBullet("Race. Two tabs can both write the cookie."), {
      tag: "Race",
      body: "Two tabs can both write the cookie.",
    });
    assert.deepEqual(parseLookForBullet("Perf. The helper copies the options object."), {
      tag: "Perf",
      body: "The helper copies the options object.",
    });
  });

  it("leaves unknown prefixes in the body", () => {
    assert.deepEqual(parseLookForBullet("For rememberMe = false, compare the cookie."), {
      body: "For rememberMe = false, compare the cookie.",
    });
    assert.deepEqual(parseLookForBullet("breaking. lowercase is not a tag."), {
      body: "breaking. lowercase is not a tag.",
    });
    assert.deepEqual(parseLookForBullet("Breaking."), {
      body: "Breaking.",
    });
  });
});

describe("lookForClaims", () => {
  it("lists document claims then group claims in stack order", () => {
    const claims = lookForClaims(
      {
        lookFor: [
          "[#12](source:s1) also asks logout to clear the session cookie. No hunk touches `src/api/logout.ts`.",
          "Subtle. [#12](source:s1) wants sessions that client scripts cannot read.",
        ],
      },
      [cookie, login, docs],
    );
    assert.deepEqual(
      claims.map((claim) => ({
        key: claim.key,
        owner: claim.owner.kind === "document" ? "Overview" : lookForOwnerLabel(claim.owner),
        tag: claim.tag,
        sourceIds: claim.sourceIds,
      })),
      [
        {
          key: "document:0",
          owner: "Overview",
          tag: undefined,
          sourceIds: ["s1"],
        },
        {
          key: "document:1",
          owner: "Overview",
          tag: "Subtle",
          sourceIds: ["s1"],
        },
        {
          key: "group:cookie:0",
          owner: "01 Session cookie helper",
          tag: "Breaking",
          sourceIds: [],
        },
        {
          key: "group:login:0",
          owner: "02 Login route",
          tag: undefined,
          sourceIds: [],
        },
      ],
    );
  });

  it("omits empty lookFor", () => {
    assert.deepEqual(lookForClaims({}, [docs]), []);
    assert.deepEqual(claimsFromLookFor({ kind: "document" }, []), []);
  });

  it("builds keys and selections from the owner", () => {
    const owner = { kind: "group" as const, id: "login", title: "Login route", index: 2 };
    assert.equal(lookForKey(owner, 0), "group:login:0");
    assert.deepEqual(selectionForLookFor(owner), { kind: "group", id: "login" });
    assert.deepEqual(selectionForLookFor({ kind: "document" }), { kind: "overview" });
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
        hunkRefs: [{ path: "src/auth/session.ts", oldStart: 1, oldLines: 20, newStart: 1, newLines: 40 }],
      },
      {
        id: "login",
        title: "Login route",
        why: "[#12](source:s1) requires HttpOnly cookies.",
        summary: "The login route uses the helper.",
        suggestedOrder: 1,
        sources: ["s1"],
        hunkRefs: [{ path: "src/api/login.ts", oldStart: 10, oldLines: 8, newStart: 10, newLines: 24 }],
      },
    ],
  };
  const claims = lookForClaims(document, document.groups);

  it("opens a line pin on the group that covers the path", () => {
    assert.deepEqual(openTargetForSource(pin, claims, document), {
      selection: { kind: "group", id: "cookie" },
      commentId: "c1",
    });
  });

  it("opens the first lookFor that cites the source", () => {
    assert.deepEqual(openTargetForSource(ticket, claims, document), {
      selection: { kind: "overview" },
      lookForKey: "document:0",
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
    assert.deepEqual(openTargetForSource(orphan, lookForClaims(withCommit, withCommit.groups), withCommit), {
      selection: { kind: "group", id: "login" },
    });
  });

  it("falls back to overview when nothing owns the source", () => {
    const extra: Source = { id: "s8", kind: "transcript", label: "Cursor session" };
    assert.deepEqual(openTargetForSource(extra, claims, document), { selection: { kind: "overview" } });
  });
});
