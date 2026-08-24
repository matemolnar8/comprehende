import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CTA_IDS, CTA_VARIANTS, DEFAULT_CTA, parseCtaId, readCtaId, stripCopy } from "./lib/cta.ts";

describe("parseCtaId", () => {
  it("accepts the five prototype ids", () => {
    assert.deepEqual(
      CTA_IDS.map((id) => parseCtaId(id)),
      [...CTA_IDS],
    );
  });

  it("rejects unknown values", () => {
    assert.equal(parseCtaId("sparkle"), null);
    assert.equal(parseCtaId(""), null);
    assert.equal(parseCtaId(undefined), null);
  });
});

describe("readCtaId", () => {
  it("reads the query string and falls back to the default", () => {
    assert.equal(readCtaId("?cta=paste"), "paste");
    assert.equal(readCtaId("cta=explain"), "explain");
    assert.equal(readCtaId("?cta=nope"), DEFAULT_CTA);
    assert.equal(readCtaId(""), DEFAULT_CTA);
  });
});

describe("CTA_VARIANTS", () => {
  it("gives each prototype a slot and a distinct idle label", () => {
    const labels = CTA_IDS.map((id) => CTA_VARIANTS[id].label);
    assert.equal(new Set(labels).size, labels.length);
    assert.equal(CTA_VARIANTS.ask.slot, "kicker");
    assert.equal(CTA_VARIANTS.explain.slot, "kicker");
    assert.equal(CTA_VARIANTS.prompt.slot, "title");
    assert.equal(CTA_VARIANTS.agent.slot, "strip");
    assert.equal(CTA_VARIANTS.paste.slot, "after");
  });

  it("puts a mark on the AI-voiced treatments, not the chip", () => {
    assert.equal(CTA_VARIANTS.ask.icon, "sparkle");
    assert.equal(CTA_VARIANTS.explain.icon, "sparkle");
    assert.equal(CTA_VARIANTS.agent.icon, "sparkle");
    assert.equal(CTA_VARIANTS.paste.icon, "clipboard");
    assert.equal(CTA_VARIANTS.prompt.icon, null);
  });
});

describe("stripCopy", () => {
  it("names the scope", () => {
    assert.equal(stripCopy("group"), "Ask an agent about this group.");
    assert.equal(stripCopy("overview"), "Ask an agent about this change.");
  });
});
