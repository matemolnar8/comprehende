Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 7cee6d1edf39a00a1134dd69629b58e821b6b6af` and `git rev-parse --verify 70c84a5c3f9069fa8a51c518fb5776dceb2aaa8a` in this repository.
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

base (merge-base)  7cee6d1edf39a00a1134dd69629b58e821b6b6af

head               70c84a5c3f9069fa8a51c518fb5776dceb2aaa8a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 7cee6d1edf39a00a1134dd69629b58e821b6b6af 70c84a5c3f9069fa8a51c518fb5776dceb2aaa8a

Commits:
- 70c84a5 0.9.1

Sources:
- transcript Cursor session · Sep 27 Mate asked for the 0.9.1 release: bump the package, run release:skill, and pin npx comprehende@0.9.1.

The title:

0.9.1

The why:

Mate asked for the 0.9.1 release [in this session](source:s1).

The what (small):

This release sets the package and the skill pin to 0.9.1, and copies the skill rules from skills-next into skills/.

## Review concerns

### 01 Publish 0.9.1 (`release`)

package.json and every SKILL.md pin say 0.9.1, and skills/ matches skills-next.

[groups/release.md](groups/release.md)