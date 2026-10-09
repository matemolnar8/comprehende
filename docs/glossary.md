# Glossary

## Concepts

**Cognitive offloading.** Hand off the _how_. Keep the _why_ and the _what_. The human still has a view of the change to compare against.

**Cognitive surrender.** Stop constructing an answer and adopt the tool's answer, with no _why_ or _what_ of your own. That is how comprehension debt grows.

**Comprehension debt.** The gap between the code in the system and the understanding the humans who develop, maintain, or operate it have. Unlike technical debt, nobody chooses it. It stays invisible until something breaks.

**The title.** Short name for the whole change. Always written. Prefer a user-created title (pull request, ticket, transcript) when it names this change. Invent one when that title is missing, vague, or names something else.

**The why.** Why this work exists. The skill writes it from tickets, issues, PR comments, coding-agent transcripts and any existing human or agent generated that's related to the change. One for the whole change when those sources name one story. Omit it when they are silent or mixed. One on every group. A group with no source of its own may exist to enable later groups. Do not invent a motive from the patch.

**The what.** What this change is. Always written. Document `summary` is the whole change. Group `summary` is that group. Named so a human has a view before they read the diff.

**The how.** How the change is implemented. The live git diff is the how. The agent may group and summarize it. The agent must not replace it.

**Look for.** Claims the live diff does not make obvious. Group `lookFor` holds claims that live in those hunks. Document `lookFor` holds whole-change and missing-work claims. Cite the source. Do not store a pass/fail. The skill writes the comparison; the field is only the place for it.

**Source.** A ticket, pull request, PR comment, commit, or transcript the skill read to write its prose. Locators plus a gist. PR comments also copy author, body, and an optional line pin. The pin is the line that comment still sits on at head, on an open thread. A resolved thread and an outdated comment keep the source and omit the pin. Transcripts have no URL.

**Citation.** A markdown link `[text](source:id)` in the why, the what, or lookFor. The UI turns it into a mark. `validate` fails on an unknown id.

## Code

**Review document.** Interpretation only. Title, groups, summaries, optional generated why, optional lookFor, sources, hunk pointers. Never patch text. Source refs must resolve in cwd.

**Group.** Schema `groups` item. The UI uses the same word.

**Review concern.** Why these hunks are read together. Not a directory, unless that directory is the concern.

**Part / story.** Independent work. Could have been its own PR. `dependsOn` only inside a story.

**Size.** Review burden. Not file or hunk count.

**Hunk ref.** Pointer into live git. Copy from the `review` skeleton. Never invent.

**Index.** Internal hunk list. No line content. Not stored in the UI. `review` writes those refs into a covering skeleton.

**Live git.** `git` in cwd at serve time. Git wins.

**Coverage.** Every live hunk in at least one group. Duplicates allowed.

**Unassigned.** Live hunks with no group. Still shown.

**Stale ref.** Pointer that does not match live git. Serve still starts. Do not invent a replacement.

**Skill.** Grouping instructions. Does not talk to git.

**CLI.** review, validate, serve, export. Cwd is the repo. `review` writes a covering skeleton only; the skill fills interpretation.
