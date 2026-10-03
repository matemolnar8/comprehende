import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EVAL_USAGE, parseAddCaseArgv, parseEvalArgv } from "./args.ts";
import { DEFAULT_GRADER_MODEL, DEFAULT_MUSECODE_MODEL, DEFAULT_PRODUCER_MODEL } from "./constants.ts";

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
      producerAgent: "cursor",
      graderAgent: "cursor",
      musecodeModel: DEFAULT_MUSECODE_MODEL,
      cursorFallback: false,
      cliLogin: false,
      graders: true,
      sandbox: true,
      rescore: undefined,
    });
  });

  it("defaults to grok 4.6 high producer and grok grader", () => {
    assert.equal(DEFAULT_PRODUCER_MODEL, "grok-4.6:effort=high");
    assert.equal(DEFAULT_GRADER_MODEL, "grok-4.6");
    const req = parseEvalArgv([]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.equal(req.producerModel, "grok-4.6:effort=high");
      assert.equal(req.graderModel, "grok-4.6");
      assert.equal(req.producerAgent, "cursor");
      assert.equal(req.graderAgent, "cursor");
      assert.equal(req.musecodeModel, DEFAULT_MUSECODE_MODEL);
      assert.equal(req.graders, true);
    }
  });

  it("parses agent and musecode model flags", () => {
    const req = parseEvalArgv([
      "--producer-agent",
      "musecode",
      "--grader-agent",
      "musecode",
      "--musecode-model",
      "muse-spark-9.9",
    ]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.equal(req.producerAgent, "musecode");
      assert.equal(req.graderAgent, "musecode");
      assert.equal(req.musecodeModel, "muse-spark-9.9");
      assert.equal(req.producerModel, DEFAULT_PRODUCER_MODEL);
    }
  });

  it("rejects an unknown agent kind", () => {
    assert.equal(parseEvalArgv(["--producer-agent", "other"]).kind, "error");
    assert.equal(parseEvalArgv(["--grader-agent", "other"]).kind, "error");
  });

  it("parses --cursor-fallback", () => {
    const req = parseEvalArgv(["--cursor-fallback"]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.equal(req.cursorFallback, true);
    }
    const plain = parseEvalArgv([]);
    assert.equal(plain.kind, "run");
    if (plain.kind === "run") {
      assert.equal(plain.cursorFallback, false);
    }
  });

  it("parses --cli-login", () => {
    const req = parseEvalArgv(["--cli-login"]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.equal(req.cliLogin, true);
    }
    const plain = parseEvalArgv([]);
    assert.equal(plain.kind, "run");
    if (plain.kind === "run") {
      assert.equal(plain.cliLogin, false);
    }
  });

  it("parses --rescore", () => {
    const req = parseEvalArgv(["--rescore", "eval/runs/stamp", "--case", "comprehende-50"]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.equal(req.rescore, "eval/runs/stamp");
      assert.deepEqual(req.ids, ["comprehende-50"]);
    }
  });

  it("parses --json with no tag as the full graded suite", () => {
    const req = parseEvalArgv(["--json"]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.deepEqual(req.ids, []);
      assert.equal(req.tag, undefined);
      assert.equal(req.json, true);
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

  it("documents --no-graders and --rescore in usage", () => {
    assert.match(EVAL_USAGE, /--no-graders/);
    assert.match(EVAL_USAGE, /--rescore/);
    assert.match(EVAL_USAGE, /--producer-agent/);
    assert.match(EVAL_USAGE, /--grader-agent/);
    assert.match(EVAL_USAGE, /--musecode-model/);
    assert.match(EVAL_USAGE, /--cursor-fallback/);
    assert.match(EVAL_USAGE, /--cli-login/);
    assert.match(EVAL_USAGE, /MUSE_CODE_API_KEY/);
  });

  it("parses add-case --pr", () => {
    const req = parseAddCaseArgv(["--pr", "https://github.com/matemolnar8/comprehende/pull/47"]);
    assert.deepEqual(req, {
      kind: "add",
      prUrl: "https://github.com/matemolnar8/comprehende/pull/47",
      id: undefined,
      bundle: false,
    });
  });

  it("parses add-case --bundle", () => {
    const req = parseAddCaseArgv(["--pr", "https://github.com/matemolnar8/cigster/pull/84", "--bundle"]);
    assert.deepEqual(req, {
      kind: "add",
      prUrl: "https://github.com/matemolnar8/cigster/pull/84",
      id: undefined,
      bundle: true,
    });
  });
});
