Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify faffb06a46ff492182596dbb26b16485f45b27a0` and `git rev-parse --verify 5f921bb44fa732555b152da19147990c4e99b664` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames faffb06a46ff492182596dbb26b16485f45b27a0 5f921bb44fa732555b152da19147990c4e99b664 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  faffb06a46ff492182596dbb26b16485f45b27a0

head               5f921bb44fa732555b152da19147990c4e99b664

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames faffb06a46ff492182596dbb26b16485f45b27a0 5f921bb44fa732555b152da19147990c4e99b664

Review concern 02 of 05: Vitest test harness (`vitest`)

Part: toolchain

The why:

The harness move needs one review: every suite switches from node:test to vite-plus/test [Run tests on Vitest, check on CI, staged pre-commit hook](source:s3).

The what:

It rewrites test imports to vite-plus/test, renames after to afterAll, and reformats suites with vp fmt, with helpers and eval cases kept alongside.

Depends on:
- 01 Vite+ toolchain config (`toolchain`)

Hunk refs for this concern:
- eval/cases/caddy-8015/case.json
- eval/cases/comprehende-59/case.json
- eval/cases/shadcn-10453/case.json
- eval/cases/starship-6388/case.json
- scripts/build-fixture.test.ts
- scripts/eval/args.test.ts
- scripts/eval/case.test.ts
- scripts/eval/checks.test.ts
- scripts/eval/clone.test.ts
- scripts/eval/env.test.ts
- scripts/eval/github.test.ts
- scripts/eval/graders.test.ts
- scripts/eval/musecode.test.ts
- scripts/eval/packet.test.ts
- scripts/eval/producer.test.ts
- scripts/eval/report.test.ts
- scripts/eval/skill.test.ts
- scripts/pages-review.test.ts
- src/api/agent-md.test.ts
- src/api/export.test.ts
- src/api/image.test.ts
- src/api/lockfile.test.ts
- src/api/paths.test.ts
- src/api/shiki-langs.test.ts
- src/cli/args.test.ts
- src/cli/commands.test.ts
- src/git/diff.test.ts
- src/git/exec.test.ts
- src/git/hooks.test.ts
- src/git/isolation.test.ts
- src/git/lfs.test.ts
- src/git/log.test.ts
- src/git/moved.test.ts
- src/git/name-status.test.ts
- src/git/repo.test.ts
- src/git/worktree.test.ts
- src/review/coverage.test.ts
- src/review/digest.test.ts
- src/review/pins.test.ts
- src/review/skeleton.test.ts
- src/schema/blame-runs.test.ts
- src/schema/identity.test.ts
- src/schema/image.test.ts
- src/schema/lockfile.test.ts
- src/schema/parse.test.ts
- src/schema/review.schema.test.ts
- src/schema/skill-sync.test.ts
- src/schema/source.test.ts
- src/server/http.test.ts
- src/test/covering-document.test.ts
- src/test/covering-document.ts
- src/test/example-repo.ts
- src/test/image-repo.ts
- src/test/png.ts
- src/ui/components/inline-md.test.ts
- src/ui/diff-hydrate.test.ts
- src/ui/lib/copy-text.test.ts
- src/ui/lib/file-nav.test.ts
- src/ui/lib/group-files.test.ts
- src/ui/lib/image-stage.test.ts
- src/ui/lib/load-diff-files.test.ts
- src/ui/lib/look-for.test.ts
- src/ui/lib/motion.test.ts
- src/ui/lib/parts.test.ts
- src/ui/lib/peek-files.test.ts
- src/ui/lib/pin-gap-expand.test.ts
- src/ui/lib/plain-click.test.ts
- src/ui/lib/reading-progress.test.ts
- src/ui/lib/relocation.test.ts
- src/ui/lib/review-ref.test.ts
- src/ui/lib/selection.test.ts
- src/ui/lib/source-display.test.ts
- src/ui/lib/story-nav.test.ts
- src/ui/lib/theme.test.ts
- src/ui/lib/viewed-files.test.ts
- src/ui/lib/wait.test.ts