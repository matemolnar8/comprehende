import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { EVAL_USAGE, parseAddCaseArgv, parseEvalArgv } from "./args.ts";
import { DEFAULT_GRADER_MODEL, DEFAULT_PRODUCER_MODEL } from "./constants.ts";

describe("eval argv", () => {
  it("parses run flags", () => {
    const req = parseEvalArgv(["--tag", "smoke", "--case", "comprehende-50", "--json"]);
    assert.deepEqual(req, {
      kind: "run",
      ids: ["comprehende-50"],
      tag: "smoke",
      baseline: undefined,
      json: true,
      producer: { agent: "muse", model: DEFAULT_PRODUCER_MODEL },
      graderModel: DEFAULT_GRADER_MODEL,
      cliLogin: false,
      graders: true,
      rescore: undefined,
      repeat: 1,
      jobs: 1,
      skill: undefined,
      keep: false,
    });
  });

  it("parses --repeat, --jobs, --skill, and --keep", () => {
    const req = parseEvalArgv(["--repeat", "3", "--jobs", "4", "--skill", "/tmp/s", "--keep"]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.equal(req.repeat, 3);
      assert.equal(req.jobs, 4);
      assert.equal(req.skill, "/tmp/s");
      assert.equal(req.keep, true);
    }
    assert.equal(parseEvalArgv(["--repeat", "0"]).kind, "error");
    assert.equal(parseEvalArgv(["--jobs", "1.5"]).kind, "error");
  });

  it("defaults producer and grader to Muse", () => {
    assert.equal(DEFAULT_PRODUCER_MODEL, "muse-spark-1.3-contributor");
    assert.equal(DEFAULT_GRADER_MODEL, "muse-spark-1.3-contributor");
    const req = parseEvalArgv([]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.deepEqual(req.producer, { agent: "muse", model: "muse-spark-1.3-contributor" });
      assert.equal(req.graderModel, "muse-spark-1.3-contributor");
      assert.equal(req.graders, true);
    }
  });

  it("parses model overrides", () => {
    const req = parseEvalArgv([
      "--producer-model",
      "muse-spark-9.9",
      "--grader-model",
      "muse-spark-9.8",
    ]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.deepEqual(req.producer, { agent: "muse", model: "muse-spark-9.9" });
      assert.equal(req.graderModel, "muse-spark-9.8");
    }
  });

  it("runs a claude-* producer in Claude Code, with an optional effort", () => {
    const req = parseEvalArgv([
      "--producer-model",
      "claude-sonnet-5-5",
      "--producer-effort",
      "high",
    ]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.deepEqual(req.producer, {
        agent: "claude",
        model: "claude-sonnet-5-5",
        effort: "high",
      });
    }
    assert.equal(
      parseEvalArgv(["--producer-model", "claude-haiku-5-5", "--producer-effort", "huge"]).kind,
      "error",
    );
    assert.equal(parseEvalArgv(["--producer-effort", "high"]).kind, "error");
  });

  it("runs a cursor/<model> producer in the Cursor CLI with the model verbatim", () => {
    const req = parseEvalArgv(["--producer-model", "cursor/claude-opus-4-8[effort=high]"]);
    assert.equal(req.kind, "run");
    if (req.kind === "run") {
      assert.deepEqual(req.producer, { agent: "cursor", model: "claude-opus-4-8[effort=high]" });
    }
    const withEffort = parseEvalArgv([
      "--producer-model",
      "cursor/gpt-5.5",
      "--producer-effort",
      "high",
    ]);
    assert.equal(withEffort.kind, "error");
    if (withEffort.kind === "error") {
      assert.match(withEffort.message, /cursor\/claude-opus-4-8\[effort=high\]/);
    }
    assert.equal(parseEvalArgv(["--producer-model", "cursor/"]).kind, "error");
  });

  it("rejects removed cursor flags", () => {
    assert.equal(parseEvalArgv(["--producer-agent", "musecode"]).kind, "error");
    assert.equal(parseEvalArgv(["--cursor-fallback"]).kind, "error");
    assert.equal(parseEvalArgv(["--sandbox"]).kind, "error");
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

  it("documents models and login in usage", () => {
    assert.match(EVAL_USAGE, /--no-graders/);
    assert.match(EVAL_USAGE, /--rescore/);
    assert.match(EVAL_USAGE, /--producer-model/);
    assert.match(EVAL_USAGE, /--grader-model/);
    assert.match(EVAL_USAGE, /--cli-login/);
    assert.match(EVAL_USAGE, /MUSE_CODE_API_KEY/);
    assert.doesNotMatch(EVAL_USAGE, /CURSOR_API_KEY/);
    assert.doesNotMatch(EVAL_USAGE, /--cursor-fallback/);
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
    const req = parseAddCaseArgv([
      "--pr",
      "https://github.com/matemolnar8/cigster/pull/84",
      "--bundle",
    ]);
    assert.deepEqual(req, {
      kind: "add",
      prUrl: "https://github.com/matemolnar8/cigster/pull/84",
      id: undefined,
      bundle: true,
    });
  });
});
