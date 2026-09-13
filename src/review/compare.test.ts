import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareReviews } from "./compare.ts";
import type { HunkRef, ReviewDocument, ReviewGroup, Source } from "../schema/types.ts";

describe("compareReviews", () => {
  it("treats identical documents as unchanged", () => {
    const document = sample();
    const comparison = compareReviews(document, structuredClone(document));
    assert.equal(comparison.identical, true);
    assert.equal(comparison.groups.added.length, 0);
    assert.equal(comparison.groups.removed.length, 0);
    assert.equal(comparison.groups.changed.length, 0);
    assert.equal(comparison.groups.unchangedCount, 1);
  });

  it("records document title, summary, why, size, range, and lookFor", () => {
    const from = sample({
      title: "Old title",
      summary: "Old summary.",
      why: "Old why.",
      size: "small",
      lookFor: ["Keep this.", "Drop this."],
    });
    const to = sample({
      title: "New title",
      summary: "New summary.",
      why: "New why.",
      size: "medium",
      source: { baseRef: "main", headRef: "feature" },
      lookFor: ["Keep this.", "Add this."],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.identical, false);
    assert.deepEqual(comparison.document.title, { from: "Old title", to: "New title" });
    assert.deepEqual(comparison.document.summary, { from: "Old summary.", to: "New summary." });
    assert.deepEqual(comparison.document.why, { from: "Old why.", to: "New why." });
    assert.deepEqual(comparison.document.size, { from: "small", to: "medium" });
    assert.deepEqual(comparison.document.range, { from: "main...HEAD", to: "main...feature" });
    assert.deepEqual(comparison.document.lookFor, { added: ["Add this."], removed: ["Drop this."] });
  });

  it("matches groups by id and flags retitle plus regroup", () => {
    const shared = hunk("src/a.ts", 1);
    const extra = hunk("src/b.ts", 4);
    const from = sample({
      groups: [group("cookie", { title: "Cookie helper", hunkRefs: [shared] })],
    });
    const to = sample({
      groups: [group("cookie", { title: "Session cookie", hunkRefs: [shared, extra] })],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.groups.changed.length, 1);
    const changed = comparison.groups.changed[0]!;
    assert.equal(changed.reason, "id");
    assert.equal(changed.retitled, true);
    assert.equal(changed.regrouped, true);
    assert.deepEqual(changed.hunks.added, [extra]);
    assert.deepEqual(changed.hunks.removed, []);
  });

  it("matches renamed ids by unique title", () => {
    const from = sample({
      groups: [group("g1", { title: "Login route", hunkRefs: [hunk("src/login.ts", 10)] })],
    });
    const to = sample({
      groups: [group("login", { title: "Login route", hunkRefs: [hunk("src/login.ts", 10)] })],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.groups.changed.length, 1);
    assert.equal(comparison.groups.changed[0]?.reason, "title");
    assert.equal(comparison.groups.changed[0]?.from.id, "g1");
    assert.equal(comparison.groups.changed[0]?.to.id, "login");
    assert.equal(comparison.groups.changed[0]?.regrouped, false);
  });

  it("matches regrouped groups by hunk overlap when ids and titles change", () => {
    const cookie = hunk("src/auth/session.ts", 1);
    const login = hunk("src/api/login.ts", 10);
    const from = sample({
      groups: [group("g1", { title: "Auth", hunkRefs: [cookie, login] })],
    });
    const to = sample({
      groups: [group("session", { title: "Session cookie helper", hunkRefs: [cookie] })],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.groups.changed.length, 1);
    assert.equal(comparison.groups.changed[0]?.reason, "hunks");
    assert.equal(comparison.groups.changed[0]?.regrouped, true);
    assert.deepEqual(comparison.groups.changed[0]?.hunks.removed, [login]);
    assert.equal(comparison.groups.added.length, 0);
    assert.equal(comparison.groups.removed.length, 0);
  });

  it("treats a split as one match plus an added group", () => {
    const cookie = hunk("src/auth/session.ts", 1);
    const login = hunk("src/api/login.ts", 10);
    const from = sample({
      groups: [group("auth", { title: "Auth", hunkRefs: [cookie, login] })],
    });
    const to = sample({
      groups: [
        group("cookie", { title: "Cookie", suggestedOrder: 0, hunkRefs: [cookie] }),
        group("login", { title: "Login", suggestedOrder: 1, hunkRefs: [login] }),
      ],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.groups.changed.length, 1);
    assert.equal(comparison.groups.changed[0]?.to.id, "cookie");
    assert.equal(comparison.groups.added.length, 1);
    assert.equal(comparison.groups.added[0]?.id, "login");
    assert.equal(comparison.groups.removed.length, 0);
  });

  it("does not match empty hunk sets by overlap", () => {
    const from = sample({
      groups: [group("a", { title: "A", hunkRefs: [] })],
    });
    const to = sample({
      groups: [group("b", { title: "B", hunkRefs: [] })],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.groups.removed[0]?.id, "a");
    assert.equal(comparison.groups.added[0]?.id, "b");
  });

  it("lists added and removed groups", () => {
    const from = sample({
      groups: [
        group("keep", { title: "Keep", suggestedOrder: 0, hunkRefs: [hunk("a.ts", 1)] }),
        group("docs", { title: "Docs", suggestedOrder: 1, hunkRefs: [hunk("README.md", 1)] }),
      ],
    });
    const to = sample({
      groups: [
        group("keep", { title: "Keep", suggestedOrder: 0, hunkRefs: [hunk("a.ts", 1)] }),
        group("logout", { title: "Logout", suggestedOrder: 1, hunkRefs: [hunk("logout.ts", 1)] }),
      ],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.groups.unchangedCount, 1);
    assert.deepEqual(
      comparison.groups.removed.map((group) => group.id),
      ["docs"],
    );
    assert.deepEqual(
      comparison.groups.added.map((group) => group.id),
      ["logout"],
    );
  });

  it("matches sources by label when ids change and remaps group source lists", () => {
    const fromSource: Source = {
      id: "s1",
      kind: "ticket",
      label: "#12",
      gist: "Old gist.",
    };
    const toSource: Source = {
      id: "ticket-12",
      kind: "ticket",
      label: "#12",
      gist: "New gist.",
    };
    const from = sample({
      sources: [fromSource],
      groups: [group("g", { sources: ["s1"], hunkRefs: [hunk("a.ts", 1)] })],
    });
    const to = sample({
      sources: [toSource],
      groups: [group("g", { sources: ["ticket-12"], hunkRefs: [hunk("a.ts", 1)] })],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.document.sources.changed.length, 1);
    assert.equal(comparison.document.sources.changed[0]?.from.id, "s1");
    assert.equal(comparison.document.sources.changed[0]?.to.id, "ticket-12");
    assert.equal(comparison.groups.changed.length, 0);
    assert.equal(comparison.groups.unchangedCount, 1);
  });

  it("ignores source href remaps when comparing prose", () => {
    const refs = [hunk("a.ts", 1)];
    const from = sample({
      why: "[#12](source:s1) requires HttpOnly cookies.",
      lookFor: ["[#12](source:s1) wants logout."],
      sources: [{ id: "s1", kind: "ticket", label: "#12" }],
      groups: [
        group("g", {
          why: "[#12](source:s1) requires HttpOnly cookies.",
          summary: "What g.",
          sources: ["s1"],
          hunkRefs: refs,
        }),
      ],
    });
    const to = sample({
      why: "[#12](source:ticket-12) requires HttpOnly cookies.",
      lookFor: ["[#12](source:ticket-12) wants logout."],
      sources: [{ id: "ticket-12", kind: "ticket", label: "#12" }],
      groups: [
        group("g", {
          why: "[#12](source:ticket-12) requires HttpOnly cookies.",
          summary: "What g.",
          sources: ["ticket-12"],
          hunkRefs: refs,
        }),
      ],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.document.why, undefined);
    assert.deepEqual(comparison.document.lookFor, { added: [], removed: [] });
    assert.equal(comparison.groups.changed.length, 0);
    assert.equal(comparison.groups.unchangedCount, 1);
    assert.match(from.why ?? "", /source:s1/);
    assert.match(to.why ?? "", /source:ticket-12/);
  });

  it("keeps original from citations when prose also changed", () => {
    const from = sample({
      why: "[#12](source:s1) requires cookies.",
      sources: [{ id: "s1", kind: "ticket", label: "#12" }],
    });
    const to = sample({
      why: "[#12](source:ticket-12) requires cookies, including logout.",
      sources: [{ id: "ticket-12", kind: "ticket", label: "#12" }],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.document.why?.from, "[#12](source:s1) requires cookies.");
    assert.equal(comparison.document.why?.to, "[#12](source:ticket-12) requires cookies, including logout.");
  });

  it("treats remapped dependsOn as unchanged", () => {
    const cookie = hunk("cookie.ts", 1);
    const login = hunk("login.ts", 1);
    const from = sample({
      groups: [
        group("g1", { title: "Cookie", why: "Cookie helper.", summary: "Sets the cookie.", suggestedOrder: 0, hunkRefs: [cookie] }),
        group("g2", { title: "Login", why: "Login route.", summary: "Calls the helper.", suggestedOrder: 1, dependsOn: ["g1"], hunkRefs: [login] }),
      ],
    });
    const to = sample({
      groups: [
        group("cookie", { title: "Cookie", why: "Cookie helper.", summary: "Sets the cookie.", suggestedOrder: 0, hunkRefs: [cookie] }),
        group("login", { title: "Login", why: "Login route.", summary: "Calls the helper.", suggestedOrder: 1, dependsOn: ["cookie"], hunkRefs: [login] }),
      ],
    });
    const comparison = compareReviews(from, to);
    assert.equal(comparison.groups.changed.length, 0);
    assert.equal(comparison.groups.unchangedCount, 2);
  });

  it("does not invent a code diff when only interpretation prose changes", () => {
    const refs = [hunk("src/a.ts", 1)];
    const from = sample({
      groups: [group("g", { why: "Old why.", summary: "Old summary.", hunkRefs: refs })],
    });
    const to = sample({
      groups: [group("g", { why: "New why.", summary: "New summary.", hunkRefs: refs })],
    });
    const comparison = compareReviews(from, to);
    const changed = comparison.groups.changed[0]!;
    assert.equal(changed.regrouped, false);
    assert.deepEqual(changed.hunks, { added: [], removed: [] });
    assert.deepEqual(changed.why, { from: "Old why.", to: "New why." });
    assert.deepEqual(changed.summary, { from: "Old summary.", to: "New summary." });
  });
});

function sample(over: Partial<ReviewDocument> = {}): ReviewDocument {
  return {
    version: 1,
    source: { baseRef: "main", headRef: "HEAD" },
    size: "small",
    title: "Review",
    summary: "A change.",
    groups: [group("all", { hunkRefs: [hunk("src/a.ts", 1)] })],
    ...over,
  };
}

function group(id: string, over: Partial<ReviewGroup> = {}): ReviewGroup {
  return {
    id,
    title: id,
    why: `Why ${id}.`,
    summary: `What ${id}.`,
    suggestedOrder: 0,
    hunkRefs: [],
    ...over,
  };
}

function hunk(path: string, start: number): HunkRef {
  return { path, oldStart: start, oldLines: 1, newStart: start, newLines: 2 };
}
