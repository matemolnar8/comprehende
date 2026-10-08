Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 59f1ceb487f0bbfa730b2919a93d1fb33c8bec19` and `git rev-parse --verify ffd116fb87c2578ef771cde505ed2a73bc886eda` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  59f1ceb487f0bbfa730b2919a93d1fb33c8bec19

head               ffd116fb87c2578ef771cde505ed2a73bc886eda

Named refs at pin: main ... feature/eval-musecode-only

Read the diff:

git diff --find-renames 59f1ceb487f0bbfa730b2919a93d1fb33c8bec19 ffd116fb87c2578ef771cde505ed2a73bc886eda

Commits:
- ffd116f Eval: run producer and graders only in Muse Code

Sources:
- pr PR #137 Run evals only in Muse Code, drop the Cursor SDK and fallback flags, load .env, simplify the eval workflow and setup notes.
  https://github.com/matemolnar8/comprehende/pull/137
- commit ffd116f Single commit carries the whole change.
- transcript Agent session · Oct 8 Cursor is too expensive for eval runs, so evals switch fully to Muse.

The title:

Eval: run producer and graders only in Muse Code

The why:

Cursor eval runs cost too much, so evals move off Cursor entirely [move off Cursor](source:s3).

The what (small):

The eval harness runs only in Muse Code, with both models defaulting to muse-spark. The Cursor SDK, probe, fallback, and agent flags are gone, and run.ts reads the repo .env for the key.

## Review concerns

### 01 Muse-only producer and graders (`runner`)

run.ts, producer.ts, and graders.ts call runMuseCodeAgent directly, and the shared result types plus the CLI-hunt check live in musecode.ts.

[groups/runner.md](groups/runner.md)

### 02 Trimmed eval flags (`args`)

args.ts drops the agent, fallback, and sandbox flags, and args.test.ts locks the Muse defaults and the rejected flags.

Depends on:
- 01 Muse-only producer and graders (`runner`)

[groups/args.md](groups/args.md)

### 03 Repo .env loading (`dotenv`)

env.ts parses the repo .env with the real environment winning, run.ts calls it before reading the key, and env.test.ts covers quotes, comments, and precedence.

Depends on:
- 01 Muse-only producer and graders (`runner`)

[groups/dotenv.md](groups/dotenv.md)

### 04 Model-only reports (`result`)

result.ts and report.ts drop the agent fields and the fallback hint, and report.test.ts plus the remaining graders.test.ts hunks pin the new output.

Depends on:
- 01 Muse-only producer and graders (`runner`)

[groups/result.md](groups/result.md)

### 05 Muse-only eval workflow (`ci`)

eval.yml installs Muse Code unconditionally, gates on MUSE_CODE_API_KEY, and runs the suite without fallback flags.

Depends on:
- 01 Muse-only producer and graders (`runner`)

[groups/ci.md](groups/ci.md)

### 06 Muse setup notes (`docs`)

AGENTS.md and docs/eval.md point at MUSE_CODE_API_KEY and the muse CLI instead of Cursor.

[groups/docs.md](groups/docs.md)