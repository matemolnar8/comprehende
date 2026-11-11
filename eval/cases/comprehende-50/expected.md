# comprehende-50: Add an Export branch for uploading the report

PR #50. No ticket, no comments. A skill change plus a repo process note in `AGENTS.md`. The PR body says the publish tool is VibeDrop, but head uses Netlify.

## Story

- Title: the PR title, "Add an Export branch for uploading the report".
- Why: optional. The PR body and the commits only say what the change does. No source states a problem or a goal. A why that restates "for uploading the report" from the title is acceptable. An invented sharing motive is not.
- Size: trivial or small.
- Parts: none or two. `AGENTS.md` can be its own part because it is repo process that could have been its own PR.
- Groups: 2.

## Groups

1. Export branch in the skill: `skills-next/comprehende/SKILL.md` and `.agents/skills/comprehende/SKILL.md`. The second file is an identical synced copy of the first, so the two read as one change.
2. PR publishing in `AGENTS.md`. It tells agents to export a review and deploy it when they open a PR.

## Must

- The PR body says agents publish the export with VibeDrop (`npx -y @vibedrop/cli deploy`), but `AGENTS.md` at head deploys with `npx -y netlify-cli deploy --allow-anonymous`.
- The PR body says the VibeDrop skill lives in `.agents/skills/vibedrop`, but the diff adds no such skill and that folder does not exist at head.
- Workflow step 8 is now a branch: an upload request runs `export` into a fresh `$EXPORT_DIR` instead of `serve`, and any other run still ends at `serve`.
- `.agents/skills/comprehende/SKILL.md` is the `pnpm sync:skill` copy of the source `skills-next/comprehende/SKILL.md` and is identical at head, so the reader can skip the copy.

## Good

- Commit `cb63fc0` says to publish the export with an anonymous Netlify Drop, so the commits agree with head and only the PR body is stale.
- The skill `description` now also triggers when the user asks to upload the report.
- `AGENTS.md` says to run the skill with the local built CLI, but the skill text pins `npx comprehende@0.6.0` for `validate`, `serve`, and `export`, so the agent has to swap the command itself.
- `AGENTS.md` says unclaimed Netlify sites last one hour, so the review link in a PR body stops working one hour after the deploy.
- The `export` command already exists in the pinned 0.6.0 CLI, because it landed in `src/cli/args.ts` before the 0.6.0 version bump.
- The released copy `skills/comprehende/SKILL.md` does not change, so users of the published skill get the Export branch only after `pnpm release:skill`.

## Must not

- Do not state as fact that agents publish with VibeDrop or that the PR adds a VibeDrop skill.
- Do not invent a why, such as sharing the review with people who do not have the repo, when no source states one.
- Do not say the Export branch runs both `export` and `serve`.
- Do not write a group attention that asks for a test of the Export branch, a rename of `$EXPORT_DIR`, or a check that the pinned CLI has `export`; a missing test, a nit, and a check request are not attentions.

## Notes

The VibeDrop claims are `Must` because the PR body and the `AGENTS.md` hunk show the mismatch on their own. The commit claim is `Good` because the PR body alone already shows the divergence.

The local-CLI mismatch is `Good`: the reader has to hold `AGENTS.md` and the skill's pinned commands side by side. The 0.6.0 `export` check and the released-skill note need reads outside the diff.

`together` keeps both `SKILL.md` copies in one group. `parts` allows 0 to 2 because a single story and a separate process part for `AGENTS.md` are both reasonable, so no `partsApart` pair is set. Inside one story, a `dependsOn` from the `AGENTS.md` group to the skill group is valid, because `AGENTS.md` uses the new Export branch. `size` allows trivial because the change is two short docs edits.

Homes: the VibeDrop claims are document `lookFor` bullets, because they compare the PR body with head. The Export branch and the identical copy live in the group summaries. The one-hour Netlify link fits a `tradeoff` attention on the `AGENTS.md` group, but it is `Good`.
