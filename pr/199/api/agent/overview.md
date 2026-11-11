Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify e5f536435fe459ec650bdb0de7a098d602e41607` and `git rev-parse --verify a52f767cbb9503f61e17b14fdc95d045bb9ec141` in this repository.
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

base (merge-base)  e5f536435fe459ec650bdb0de7a098d602e41607

head               a52f767cbb9503f61e17b14fdc95d045bb9ec141

Named refs at pin: e5f536435fe459ec650bdb0de7a098d602e41607 ... a52f767cbb9503f61e17b14fdc95d045bb9ec141

Read the diff:

git diff --find-renames e5f536435fe459ec650bdb0de7a098d602e41607 a52f767cbb9503f61e17b14fdc95d045bb9ec141

Commits:
- a52f767c Skill: a title that counts its fixes names one story per fix

Sources:
- pr PR #199 vitadeck-150 eval failed on a bundled repo-traps part.
  https://github.com/matemolnar8/comprehende/pull/199

The title:

Skill: a title that counts its fixes names one story per fix

The why:

[PR #199](source:s1) says vitadeck-150 put four independent fixes in one part because the title says "fix four repo traps".

The what (trivial):

The Parts rule makes each item under a shared motive its own story.

## Review concerns

### 01 Shared motive splits into stories (`shared-motive`)

The shared-motive bullet under Parts adds a title that counts its fixes, and makes each item that could be its own PR its own story.

Attention (tradeoff):
The old text said the work "can still be several stories"; the new text says each such item "is its own story". This beats a bundling title, but a cleanup sweep of small unrelated items can now split into more parts. The bullet about agent-doc notes still keeps those as one story.

[groups/shared-motive.md](groups/shared-motive.md)