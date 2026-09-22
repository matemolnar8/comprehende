Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a05aef85c489e9ccd5c42f7b3397219b35b95719` and `git rev-parse --verify d5c726fc18d330571360e3494af7bdd78ea6e0f3` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 d5c726fc18d330571360e3494af7bdd78ea6e0f3 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a05aef85c489e9ccd5c42f7b3397219b35b95719

head               d5c726fc18d330571360e3494af7bdd78ea6e0f3

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 d5c726fc18d330571360e3494af7bdd78ea6e0f3

Review concern 02 of 03: Name the injected CLI as a built fact (`prompt`)

The why:

[#97](source:s1) says “The CLI named in the skill is the local build” sent the producer hunting for a path, and once built the reviewed repo’s older CLI.

The what:

`producerPrompt` takes `cliPath` and tells the agent that `node <abs>/dist/cli/main.js` is the CLI, it is already built, and it must run that command as written.

Look for:
- The producer `review` and `validate` shell commands should be `node /…/dist/cli/main.js`, not a build of the work tree’s own CLI.

Hunk refs for this concern:
- scripts/eval/producer.ts @@ -7,11 +7,13 @@
- scripts/eval/producer.test.ts @@ -0,0 +1,36 @@
- scripts/eval/run.ts @@ -123,7 +125,7 @@
- scripts/eval/run.ts @@ -149,6 +151,7 @@