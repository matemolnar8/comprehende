# comprehende-50: Add an Export branch for uploading the report

PR #50. No ticket, no comments. A skill change plus a repo process note in `AGENTS.md`. The PR body says the publish tool is VibeDrop, but head uses Netlify.

## Story

- Title: the PR title, "Add an Export branch for uploading the report".
- Why: optional. The PR body and the commits only say what the change does. No source states a problem or a goal. A why that restates "for uploading the report" from the title is acceptable. An invented sharing motive is not.
- Size: trivial or small.
- Parts: none, one, or two. `AGENTS.md` can be its own part because it is repo process that could have been its own PR.
- Groups: 2.

## Groups

1. Export branch in the skill: `skills-next/comprehende/SKILL.md` and `.agents/skills/comprehende/SKILL.md`. The second file is an identical synced copy of the first, so the two read as one change.
2. PR publishing in `AGENTS.md`. It tells agents to export a review and deploy it when they open a PR. It reads alone and has no `dependsOn` to group 1.

## Must

- The PR body says agents publish the export with VibeDrop (`npx -y @vibedrop/cli deploy`), but `AGENTS.md` at head runs `npx -y netlify-cli deploy --allow-anonymous` and puts `site_url` and `password` in the PR body.
- The PR body says the VibeDrop skill lives in `.agents/skills/vibedrop`, but the diff adds no such skill and that folder does not exist at head.
- Workflow step 8 is now a branch: when the user asks to upload the report, the skill runs `export` into a fresh `$EXPORT_DIR` and does not start `serve`; otherwise it runs `serve` as before.
- `.agents/skills/comprehende/SKILL.md` gets the same change as `skills-next/comprehende/SKILL.md`, and the two files are identical at head, so the reader can skip the copy.

## Good

- `AGENTS.md` says to run the skill with the local built CLI, but the skill text pins `npx comprehende@0.6.0` for `validate`, `serve`, and `export`, so the agent has to swap the command itself.
- `AGENTS.md` says unclaimed Netlify sites last one hour, so the review link in a PR body stops working one hour after the deploy.
- The `export` command already exists in the pinned 0.6.0 CLI: `src/cli/args.ts` lists it, and it landed before the 0.6.0 version bump.
- The released copy `skills/comprehende/SKILL.md` does not change, so users of the published skill get the Export branch only after `pnpm release:skill`.

## Must not

- Do not state as fact that agents publish with VibeDrop or that the PR adds a VibeDrop skill.
- Do not put the two `SKILL.md` copies in separate story groups, or review the `.agents/` copy as its own change.
- Do not add a `dependsOn` from the `AGENTS.md` group to the skill group.
- Do not invent a why, such as sharing the review with people who do not have the repo, when no source states one.
- Do not say the Export branch runs both `export` and `serve`.

## Notes

The VibeDrop claims are `Must` because the PR body and the `AGENTS.md` hunk show the mismatch on their own. Commit `cb63fc0` says "anonymous Netlify Drop", so the commits agree with head and only the PR body is stale.

The local-CLI mismatch is `Good`: the reader has to hold `AGENTS.md` and the skill's pinned commands side by side. The 0.6.0 `export` check and the released-skill note need reads outside the diff.

`groups` allows 3 because a review may keep the draft mirror cluster (both `SKILL.md` copies) as a trailing group beside the Export group. `parts` allows 0 to 2 because a single story and a separate process part for `AGENTS.md` are both reasonable. `size` allows trivial because the change is two short docs edits.
