Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fb5512b5d35ae631ce90b41c889b41320b2e4e71` and `git rev-parse --verify e2c6a91e0ae0ead403f7483a9d8ffed467205ddc` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames fb5512b5d35ae631ce90b41c889b41320b2e4e71 e2c6a91e0ae0ead403f7483a9d8ffed467205ddc -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  fb5512b5d35ae631ce90b41c889b41320b2e4e71

head               e2c6a91e0ae0ead403f7483a9d8ffed467205ddc

Named refs at pin: fb5512b5d35ae631ce90b41c889b41320b2e4e71 ... HEAD

Read the diff:

git diff --find-renames fb5512b5d35ae631ce90b41c889b41320b2e4e71 e2c6a91e0ae0ead403f7483a9d8ffed467205ddc

Review concern 01 of 01: Why rule: situation is optional (`mirrors-1`)

The what:

`skills-next/comprehende/SKILL.md` changes one line of The why, and the synced copy in `.agents/skills` repeats it, so read the first and skip the copy.

Attention (tradeoff):
The rule drops "or the sources are mixed" and relies on the last sentence about two unrelated stories. A request whose sources disagree on the motive now gets a why from one of them.

Hunk refs for this concern:
- .agents/skills/comprehende/SKILL.md
- skills-next/comprehende/SKILL.md