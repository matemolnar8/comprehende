import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { storyNav } from "./story-nav.ts";

const cookie = {
  id: "cookie",
  title: "Session cookie helper",
  part: "Session cookie",
  suggestedOrder: 0,
};
const login = {
  id: "login",
  title: "Login route",
  part: "Session cookie",
  suggestedOrder: 1,
  dependsOn: ["cookie"],
};
const docs = {
  id: "docs",
  title: "README wording",
  part: "README",
  suggestedOrder: 2,
};

describe("storyNav", () => {
  it("walks dependsOn inside one part and hops to the next part at the end", () => {
    const groups = [login, cookie, docs];
    const start = storyNav(groups, "cookie");
    assert.equal(start.partTitle, "Session cookie");
    assert.equal(start.previous, undefined);
    assert.equal(start.next?.id, "login");
    assert.equal(start.next?.axis, "group");
    assert.deepEqual(start.dependents.map((hop) => hop.id), ["login"]);
    assert.equal(start.nextPart?.id, "docs");

    const mid = storyNav(groups, "login");
    assert.equal(mid.previous?.id, "cookie");
    assert.equal(mid.next, undefined);
    assert.equal(mid.nextPart?.id, "docs");
    assert.equal(mid.nextPart?.axis, "part");
    assert.equal(mid.nextPart?.partTitle, "README");
    assert.deepEqual(mid.dependsOn.map((hop) => hop.id), ["cookie"]);

    const other = storyNav(groups, "docs");
    assert.equal(other.previous, undefined);
    assert.equal(other.previousPart?.id, "cookie");
    assert.equal(other.nextPart, undefined);
  });

  it("stays inside an unlabeled review", () => {
    const nav = storyNav(
      [
        { id: "a", title: "A", suggestedOrder: 0 },
        { id: "b", title: "B", suggestedOrder: 1, dependsOn: ["a"] },
      ],
      "a",
    );
    assert.equal(nav.nextPart, undefined);
    assert.equal(nav.next?.id, "b");
  });

  it("lists every dependent, not only the next group", () => {
    const nav = storyNav(
      [
        { id: "schema", title: "Schema", part: "Contract", suggestedOrder: 0 },
        { id: "cli", title: "CLI", part: "Contract", suggestedOrder: 1, dependsOn: ["schema"] },
        { id: "ui", title: "UI", part: "Contract", suggestedOrder: 2, dependsOn: ["schema"] },
      ],
      "schema",
    );
    assert.deepEqual(
      nav.dependents.map((hop) => hop.id),
      ["cli", "ui"],
    );
    assert.equal(nav.next?.id, "cli");
  });
});
