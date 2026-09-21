Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 18bd5cba8d77a1b2d462b98aece1d90746049f97` and `git rev-parse --verify 1eea21a29c94171869da0b89506e39b231b60999` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  18bd5cba8d77a1b2d462b98aece1d90746049f97

head               1eea21a29c94171869da0b89506e39b231b60999

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 18bd5cba8d77a1b2d462b98aece1d90746049f97 1eea21a29c94171869da0b89506e39b231b60999

Commits:
- 1eea21a Fix pack-smoke export asserts for the review skeleton.
- 5645b4d Remove the public index CLI command.

Sources:
- transcript Cursor session · Sep 21 Remove leftover public index CLI. Keep hunk indexing as an internal library used by review. Leave the published skill until a release.
- pr PR #98 Drop index from the public CLI. Keep cmdIndex as an internal library. Leave skills/comprehende unchanged.
  https://github.com/matemolnar8/comprehende/pull/98

The title:

Remove the public index CLI command

The why:

[The session](source:s1) asks to drop leftover public `comprehende index` after `review` became the skill path.

The what (small):

The public `index` command is gone. `review` still writes the covering skeleton. Docs and the next skill point at `review`.

Look for:
- [The session](source:s1) asks to leave `skills/comprehende/` until a release. No hunk touches that tree.
- [The session](source:s1) prefers no `package.json` bump. No hunk edits that file.

## Review concerns

### 01 Drop the public command (`cli`)

`CommandName` and `--help` drop `index`. `main` no longer prints that hunk list.

[groups/cli.md](groups/cli.md)

### 02 Reject index in parse and help (`cli-tests`)

`parseArgv` and `run` treat `index` as an unknown command.

Depends on:
- 01 Drop the public command (`cli`)

[groups/cli-tests.md](groups/cli-tests.md)

### 03 Packed bin uses the skeleton (`pack-smoke`)

The packed bin rejects `index` and validates the `review` skeleton.

Depends on:
- 01 Drop the public command (`cli`)

[groups/pack-smoke.md](groups/pack-smoke.md)

### 04 Point agents at review (`docs`)

README, AGENTS.md, and the next-skill example send agents to `review`.

[groups/docs.md](groups/docs.md)