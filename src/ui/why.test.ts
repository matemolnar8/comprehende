import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { commitSpeaks, stripGitTrailers, whyModel } from "./lib/why.ts";

describe("stripGitTrailers", () => {
  it("drops Co-authored-by and leaves the reason", () => {
    assert.equal(
      stripGitTrailers("Import flooded MusicBrainz.\n\nCo-authored-by: Máté Molnár <mate@example.com>"),
      "Import flooded MusicBrainz.",
    );
  });

  it("returns empty when the body is only trailers", () => {
    assert.equal(stripGitTrailers("Co-authored-by: A <a@example.com>\nMade-with: Cursor"), "");
  });

  it("keeps a Fix: line that is the whole body", () => {
    assert.equal(stripGitTrailers("Fix: the queue never started"), "Fix: the queue never started");
  });
});

describe("commitSpeaks", () => {
  it("treats merge boilerplate as silent", () => {
    assert.equal(commitSpeaks({ subject: "Merge pull request #95 from matemolnar8/tv", body: "" }), false);
    assert.equal(commitSpeaks({ subject: "Merge branch 'main' into feature", body: "real text" }), false);
  });

  it("keeps a normal subject even with an empty body", () => {
    assert.equal(commitSpeaks({ subject: "Fix MusicBrainz rate limits on song import", body: "" }), true);
  });
});

describe("whyModel", () => {
  const commit = {
    sha: "abc1234deadbeef",
    shortSha: "abc1234",
    subject: "Fix MusicBrainz rate limits on song import",
    body: "Import flooded the API.\n\nCo-authored-by: Máté Molnár <mate@example.com>",
    author: "Cursor Agent",
    date: "2026-08-03",
  };

  it("uses a single ticket title as the heading", () => {
    const why = whyModel({
      tickets: [{ id: "#89", title: "Fix MusicBrainz rate limits during song/playlist import" }],
      commits: [commit],
    });
    assert.equal(why.hasWhy, true);
    assert.equal(why.heading, "Fix MusicBrainz rate limits during song/playlist import");
    assert.equal(why.headingTicketId, "#89");
    assert.equal(why.commits[0]?.body, "Import flooded the API.");
  });

  it("prefers walkthrough over a ticket title", () => {
    const why = whyModel({
      walkthrough: "Split the git index from the UI.",
      tickets: [{ id: "#12", title: "Split the git index from the UI" }],
      commits: [],
    });
    assert.equal(why.heading, "Split the git index from the UI.");
    assert.equal(why.headingTicketId, undefined);
  });

  it("does not smash two ticket titles into one heading", () => {
    const why = whyModel({
      tickets: [
        { id: "#92", title: "Ten-Foot TV Presentation Mode", part: "TV stage" },
        { id: "#94", title: "Phone Co-Pilot", part: "Co-pilot" },
      ],
      commits: [],
    });
    assert.equal(why.heading, undefined);
    assert.equal(why.tickets.length, 2);
    assert.equal(why.hasWhy, true);
  });

  it("says there is no why when tickets are missing and commits are silent", () => {
    const why = whyModel({
      commits: [
        {
          sha: "1",
          shortSha: "1",
          subject: "Merge pull request #1 from x/y",
          body: "",
          author: "GitHub",
          date: "2026-08-01",
        },
      ],
    });
    assert.equal(why.hasWhy, false);
    assert.equal(why.commits.length, 0);
    assert.equal(why.heading, undefined);
  });

  it("treats walkthrough as why when tickets and commits are silent", () => {
    const why = whyModel({
      walkthrough: "Stop per-song MusicBrainz lookups from flooding the API.",
      commits: [
        {
          sha: "1",
          shortSha: "1",
          subject: "Merge pull request #1 from x/y",
          body: "",
          author: "GitHub",
          date: "2026-08-01",
        },
      ],
    });
    assert.equal(why.hasWhy, true);
    assert.equal(why.heading, "Stop per-song MusicBrainz lookups from flooding the API.");
    assert.equal(why.tickets.length, 0);
    assert.equal(why.commits.length, 0);
  });
});
