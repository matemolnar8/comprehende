Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify df677575fda82ed86e32754f10d70d9f5992cf23` and `git rev-parse --verify e7578d9f0cfb1119b603c616c364d2bb1e2436ac` in this repository.
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
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  df677575fda82ed86e32754f10d70d9f5992cf23

head               e7578d9f0cfb1119b603c616c364d2bb1e2436ac

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 e7578d9f0cfb1119b603c616c364d2bb1e2436ac

Commits:
- e7578d9 Digest: a generated marker is a statement about the file, not a mention
- 74957ce Skill: citation, shared helper, and version pin rules as actions in the steps
- 548bdd6 Digest: a file whose head blob says it is generated is generated

Sources:
- pr PR #153 Content marker for generated files in the digest; three skill rules moved into the steps. Starship and this repo keep JSON schemas with no marker, so they stay logic.
  https://github.com/matemolnar8/comprehende/pull/153

The title:

Digest reads generated markers; skill names citation, shared helper, and pin rules in the steps

The why:

The census of graded eval runs blamed a generated schema folded into a docs group, and three recurring majors whose rules lived only in reference sections ([PR #153](source:s1)).

The what (small):

Two stories: the digest classes a file generated when the first lines of its head blob say so, and the skill states three grouping and citation rules as actions in steps 3 and 4.

Look for:
- The [PR body](source:s1) says starship's `.github/config-schema.json` and this repo's `src/schema/review.schema.json` still digest as logic; nothing in the diff reads `.gitattributes` or JSON content, so that stays true at head.
- The [PR body](source:s1) says the skill rules are unmeasured. The diff changes no eval case or grader, so no check in this repo covers the three new sentences.

## Review concerns

### 01 readDiff flags generated files (`marker`)

`generatedPaths` in `generated.ts` runs one `git grep` at head over the changed files, and `markGenerated` in `diff.ts` sets the new `generated` field on each `DiffFile` whose first 20 lines hold a marker.

[groups/marker.md](groups/marker.md)

### 02 The digest classes a flagged file generated (`digest`)

`classifyKind` in `digest.ts` returns `generated` for a flagged file right after the rename and copy checks, so the flag wins over the test and docs path classes.

Depends on:
- 01 readDiff flags generated files (`marker`)

[groups/digest.md](groups/digest.md)

### 03 Three rules as step actions (`skill`)

Step 3 gives the dependency policy story a concrete example, step 4 turns the citation rule into a find-the-sentence action with a Done clause and places shared helpers in the foundation group, and the foundation bullet in Grouping rules says the same; `.agents/skills/comprehende/SKILL.md` is the synced copy.

[groups/skill.md](groups/skill.md)