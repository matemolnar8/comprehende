# Comprehende

This is a tool that helps us, humans understand (comprehend) AI code changes, such as PR diffs, or per-turn changes, or any diff that we define. Reading PR diffs line by line, in alphabetical order never made sense, and it's time we do something about it, provide us with a way of reviewing code changes in a scalable, easy to digest form, without losing on fidelity.

## Background

AI agents write more code than humans can review line by line. This tool moves review from cognitive surrender to cognitive offloading. The [glossary](./docs/glossary.md) defines both. The full argument is in the README.

## What the tool is

It's a review assistant tool, which users can run as a skill (invoked using slash command). This will take a diff (PR, turn diff, or anything needing a review), analyze it, find review groups and visualize them on a web UI.

### Goals

- 100% accuracy: live git wins. The review document is interpretation only.
- Easy on the eyes, easy to read
- Allow drilling down to full files instead of the diff, git blames, commit messages, branches, and the sources the skill read
- Useful summaries of the issues and other sources.
- UI is always the same, not generated on the fly. Only the data changes.
- Works locally, no need for hosted services, deployed packages
- Simple easy-to-understand wording throughout the UI and in the generated answers, using ASD-STE100 Simplified Technical English

## Glossary

Read [docs/glossary.md](./docs/glossary.md) before editing the skill, the schema, the review code, or UI copy.

## Project rules

Skill edits go in `skills-next/comprehende/`. `pnpm release:skill` writes `skills/comprehende/` and `pnpm sync:skill` writes `.agents/skills/comprehende/`. Leave both alone. Edit source under `src/` normally.

Whenever you create or edit `skills-next/comprehende/SKILL.md`, or run `pnpm release:skill` or `pnpm sync:skill`, read and follow the `writing-for-agents` skill first.

The skill reviews any git repository. Write its rules so they fit any diff. Keep this repo's layers, modules, and product out of those examples.

Component look lives on the component. Tailwind first. If a bit of CSS is required, colocate it with that component using a CSS module. A component must not import a global stylesheet. Do not add descendant selectors in `styles.css` to style markup a component already owns. `styles.css` holds globals such as variables and themes. Exception: `src/ui/lib/gap-style.ts` may use descendant selectors to style Pierre markup.

If the UI already shows the state, do not add a sentence that narrates it.

README is for people using the tool. Change it when a command, install step, or other user-visible behavior changes. Leave it alone for internal implementation.

Type safety helps humans and agents alike. Parse at the boundary, where the schema is the source of truth, and infer everywhere inside. If a bug could have been a type error, make it one before fixing it.

Releases happen manually. Do not change `package.json` version unless the user asks for a release. When they do, follow the Release section in [README.md](./README.md). The release commit subject is the version. The body is the release notes: every user-visible CLI, UI, and skill change since the previous version, taken from `git log <previous>..HEAD`.

## Pull requests

When opening a pull request, run the local built CLI `comprehende review --data <path>` to write the covering skeleton (one path per changed file, stub prose). Fill interpretation with the comprehende skill from skills-next. Do not paste hunk refs by hand. Export the review, then host that folder with the pages skill. Put the printed URL in the PR body.

After a change under `skills-next/comprehende/`, `src/schema/`, or `src/review/`, run `pnpm eval -- --tag smoke --no-graders` and paste the summary lines in the PR body. Needs `CURSOR_API_KEY`. Exit 1 means validate broke or an expect drifted from current product. Smoke does not run graders.

A merge to `main` that touches those paths (or `scripts/eval/`, `eval/cases/`) runs the full graded suite: workflow `.github/workflows/eval.yml`, repo secret `CURSOR_API_KEY`. A failed job is the regression ping. If that secret is unset, the workflow skips; launch a cloud agent after the merge and run `pnpm eval`. Manual full suite is for skill redesign.

Eval commands, run times, and what to do when a run aborts: [docs/eval.md](./docs/eval.md). Read it before you run `pnpm eval`.

Judgement rules for review: [.cursor/BUGBOT.md](./.cursor/BUGBOT.md).

## Notes from Máté, the repo owner

I love to see simple code solving real, complex problems. Make every change, design, and text in that spirit. The skill is reviewed and adjusted by me manually, but write it with these principles in mind too.

I don't want this project to get overly complicated. In practice this means I want to keep the code focusing on the universal Git part, not specifics of any Git forge or issue tracker - those must be handled at the skill level.

Watch out for small, quick neat wins and the attention to detail that makes people say wow, that's cool.

## Cursor Cloud specific instructions

To open the mixed fixture UI (colored Overview stories and lookFor) without writing `review.json`: run `pnpm fixture`, then the printed serve command from that cwd. The process prints the URL (`http://127.0.0.1:<port>`).

UI smoke for that fixture (`#overview` and one `#group/...`, then exit): `pnpm fixture:smoke`.
