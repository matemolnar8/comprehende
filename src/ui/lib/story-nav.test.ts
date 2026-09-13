import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { storyNav } from "./story-nav.ts";

const cookie = {
  id: "cookie",
  title: "Session cookie helper",
};
const login = {
  id: "login",
  title: "Login route",
  dependsOn: ["cookie"],
};
const docs = {
  id: "docs",
  title: "README wording",
};

describe("storyNav", () => {
  it("lists dependsOn and Needed by hops", () => {
    const groups = [login, cookie, docs];
    assert.deepEqual(storyNav(groups, "cookie").dependents.map((hop) => hop.id), ["login"]);
    assert.deepEqual(storyNav(groups, "login").dependsOn.map((hop) => hop.id), ["cookie"]);
    assert.deepEqual(storyNav(groups, "docs"), { dependsOn: [], dependents: [] });
  });

  it("lists every dependent, not only the next group", () => {
    const nav = storyNav(
      [
        { id: "schema", title: "Schema" },
        { id: "cli", title: "CLI", dependsOn: ["schema"] },
        { id: "ui", title: "UI", dependsOn: ["schema"] },
      ],
      "schema",
    );
    assert.deepEqual(
      nav.dependents.map((hop) => hop.id),
      ["cli", "ui"],
    );
  });

  it("skips dependsOn ids that are not in the review", () => {
    const nav = storyNav([{ id: "login", title: "Login route", dependsOn: ["missing"] }], "login");
    assert.deepEqual(nav.dependsOn, []);
  });
});
