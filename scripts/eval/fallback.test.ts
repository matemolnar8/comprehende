import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RateLimitError } from "@cursor/sdk";
import { classifyCursorProbe, isUsageLimitMessage } from "./fallback.ts";
import type { AgentRunResult } from "./agent.ts";

const finished: AgentRunResult = {
  text: "OK",
  status: "finished",
  durationMs: 1,
  tokens: 1,
  steps: 1,
  toolCalls: [],
};

describe("usage limit detection", () => {
  it("matches limit wording and 429", () => {
    for (const message of [
      "Rate limit exceeded",
      "usage limits exceeded",
      "Too many requests",
      "request failed with 429",
      "quota exceeded for this billing period",
    ]) {
      assert.equal(isUsageLimitMessage(message), true, message);
    }
  });

  it("rejects other failures", () => {
    for (const message of ["agent timed out after 120000ms", "Invalid API key", "Service unavailable", ""]) {
      assert.equal(isUsageLimitMessage(message), false, message);
    }
  });
});

describe("cursor probe classification", () => {
  it("passes a finished run", () => {
    assert.deepEqual(classifyCursorProbe({ result: finished }), { ok: true });
  });

  it("flags a thrown RateLimitError as a limit", () => {
    const probe = classifyCursorProbe({ thrown: new RateLimitError("usage limits exceeded") });
    assert.deepEqual(probe, { ok: false, limit: true, reason: "usage limits exceeded" });
  });

  it("flags other thrown errors without the limit bit", () => {
    const probe = classifyCursorProbe({ thrown: new Error("agent timed out after 120000ms") });
    assert.equal(probe.ok, false);
    if (!probe.ok) {
      assert.equal(probe.limit, false);
      assert.match(probe.reason, /timed out/);
    }
  });

  it("reads the limit from an error-status result", () => {
    const probe = classifyCursorProbe({
      result: { ...finished, status: "error", error: "Too many requests" },
    });
    assert.deepEqual(probe, { ok: false, limit: true, reason: "Too many requests" });
  });

  it("fails closed on an error result with no message", () => {
    const probe = classifyCursorProbe({ result: { ...finished, status: "error" } });
    assert.equal(probe.ok, false);
    if (!probe.ok) {
      assert.equal(probe.limit, false);
    }
  });
});
