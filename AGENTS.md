# Comprehende

This is a tool that helps us, humans understand (comprehend) AI code changes, such as PR diffs, or per-turn changes, or any diff that we define. Reading PR diffs line by line, in alphabetical order never made sense, and it's time we do something about it, provide us with a way of reviewing code changes in a scalable, easy to digest form, without losing on fidelity.

## Background

AI agents write more code than humans can review line by line. This tool moves review from cognitive surrender to cognitive offloading. The glossary below defines both. The full argument is in the README.

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

### Concepts

**Cognitive offloading.** Hand off the _how_. Keep the _why_ and the _what_. The human still has a view of the change to compare against.

**Cognitive surrender.** Stop constructing an answer and adopt the tool's answer, with no _why_ or _what_ of your own. That is how comprehension debt grows.

**Comprehension debt.** The gap between the code in the system and the understanding the humans who develop, maintain, or operate it have. Unlike technical debt, nobody chooses it. It stays invisible until something breaks.

**The title.** Short name for the whole change. Always written. Prefer a user-created title (pull request, ticket, transcript) when it names this change. Invent one when that title is missing, vague, or names something else.

**The why.** Why this work exists. The skill writes it from tickets, issues, PR comments, coding-agent transcripts and any existing human or agent generated that's related to the change. One for the whole change when those sources name one story. Omit it when they are silent or mixed. One on every group. A group with no source of its own may exist to enable later groups. Do not invent a motive from the patch.

**The what.** What this change is. Always written. Document `summary` is the whole change. Group `summary` is that group. Named so a human has a view before they read the diff.

**The how.** How the change is implemented. The live git diff is the how. The agent may group and summarize it. The agent must not replace it.

**Source.** A ticket, pull request, PR comment, commit, or transcript the skill read to write its prose. Locators plus a gist. PR comments also copy author, body, and an optional line pin. Transcripts have no URL.

**Citation.** A markdown link `[text](source:id)` in the why or the what. The UI turns it into a mark. `validate` fails on an unknown id.

### Code

**Review document.** Interpretation only. Title, groups, summaries, optional generated why, sources, hunk pointers. Never patch text. Source refs must resolve in cwd.

**Group.** Schema `groups` item. The UI uses the same word.

**Review concern.** Why these hunks are read together. Not a directory, unless that directory is the concern.

**Part / story.** Independent work. Could have been its own PR. `dependsOn` only inside a story.

**Size.** Review burden. Not file or hunk count.

**Hunk ref.** Pointer into live git. Copy from `index`. Never invent.

**Index.** Hunk list for the agent. No line content. Not stored in the UI.

**Live git.** `git` in cwd at serve time. Git wins.

**Coverage.** Every live hunk in at least one group. Duplicates allowed.

**Unassigned.** Live hunks with no group. Still shown.

**Stale ref.** Pointer that does not match live git. Serve still starts. Do not invent a replacement.

**Skill.** Grouping instructions. Does not talk to git.

**CLI.** Git, validate, serve. Cwd is the repo.

## Project rules

Skill edits go in `skills-next/comprehende/`. `pnpm release:skill` writes `skills/comprehende/` and `pnpm sync:skill` writes `.agents/skills/comprehende/`. Leave both alone. Edit source under `src/` normally.

Component look lives on the component. Tailwind first. If a bit of CSS is required, colocate it with that component using a CSS module. A component must not import a global stylesheet. Do not add descendant selectors in `styles.css` to style markup a component already owns. `styles.css` holds globals such as variables and themes.

If the UI already shows the state, do not add a sentence that narrates it.

README is for people using the tool. Change it when a command, install step, or other user-visible behavior changes. Leave it alone for internal implementation.

Type safety helps humans and agents alike. Parse at the boundary, where the schema is the source of truth, and infer everywhere inside. If a bug could have been a type error, make it one before fixing it.

Releases happen manually. Updating package.json should be explicitly requested (like asking for a release), don't do it automatically.

Release flow: when the user asks for a release, bump `version` in `package.json`. Use the number they name. If they do not name one, pick the next semver from the changes since the last release (patch for fixes, minor for new capability, major for breaking). Match that version in the README `npx` pin. Run `pnpm release:skill` so the skill pin matches.

## Pull requests

When opening a pull request, run the comprehende skill from skills-next on that PR using the local built CLI, export the review, and publish the folder with VibeDrop:

```sh
npx -y @vibedrop/cli deploy "$EXPORT_DIR"
```

Put the site URL in the PR body. If a claim URL is printed, include it. Do not print the API key. Leave the site unlisted.

## Notes from Máté, the repo owner

I love to see simple code solving real, complex problems. Make every change, design, and text in that spirit. The skill is reviewed and adjusted by me manually, but write it with these principles in mind too.

I don't want this project to get overly complicated. In practice this means I want to keep the code focusing on the universal Git part, not specifics of any Git forge or issue tracker - those must be handled at the skill level.
