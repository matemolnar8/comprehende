import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EVAL_USAGE, parseAddCaseArgv, parseEvalArgv } from "./args.ts";
import { DEFAULT_GRADER_MODEL, DEFAULT_PRODUCER_MODEL } from "./constants.ts";

describe("eval argv", () => {
  it("parses run flags", () => {
    const req = parseEvalArgv(["--tag", "smoke", "--case", "comprehende-50", "--json", "--sandbox"]);
    assert.deepEqual(req, {
      kind: "run",
      ids: ["comprehende-50"],
      tag: "smoke",
      baseline: undefined,
      json: true,
      producerModel: DEFAULT_PRODUCER_MODEL,
      graderModel: DEFAULT_GRADER_MODEL,
      graders: true,
      sandbox: true,
    });
  });

  it("defaults to composer producer and grok grader", () => {
    assert.equal(DEFAULT_PRODUCER_MODEL, "composer-2.5");
    assert.equal(DEFAULT_GRADER_MODEL, "grok-4.6");
    const req = parseEvalArgv([]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.equal(req.producerModel, "composer-2.5");
      assert.equal(req.graderModel, "grok-4.6");
      assert.equal(req.graders, true);
    }
  });

  it("parses --no-graders", () => {
    const req = parseEvalArgv(["--tag", "smoke", "--no-graders"]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.equal(req.tag, "smoke");
      assert.equal(req.graders, false);
      assert.equal(req.graderModel, DEFAULT_GRADER_MODEL);
    }
  });

  it("rejects unknown options", () => {
    assert.equal(parseEvalArgv(["--nope"]).kind, "error");
  });

  it("documents --no-graders in usage", () => {
    assert.match(EVAL_USAGE, /--no-graders/);
  });

  it("parses add-case --pr", () => {
    const req = parseAddCaseArgv(["--pr", "https://github.com/matemolnar8/comprehende/pull/47"]);
    assert.deepEqual(req, {
      kind: "add",
      prUrl: "https://github.com/matemolnar8/comprehende/pull/47",
      id: undefined,
    });
  });
});
