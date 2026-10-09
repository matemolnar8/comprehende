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

Review concern 04 of 05: Lint and format sweep (`lint`)

Part: toolchain

The why:

Type-aware lint surfaces errors the migration must fix [Migrate to Vite+ 1.1.0](source:s1), and the last commit clears the remaining warnings [Resolve all vp check warnings](source:s4).

The what:

It applies vp fmt across source, scripts, and UI and fixes the type errors type-aware lint reports; the reader can skip pure reformatting and spot-check the type fixes.

Depends on:
- 01 Vite+ toolchain config (`toolchain`)

Hunk refs for this concern:
- scripts/check-skill-sync.ts
- scripts/eval/add-case.ts
- scripts/eval/checks.ts
- scripts/eval/clone.ts
- scripts/eval/env.ts
- scripts/eval/github.ts
- scripts/eval/graders.ts
- scripts/eval/musecode.ts
- scripts/eval/packet.ts
- scripts/eval/report.ts
- scripts/eval/result.ts
- scripts/eval/run.ts
- scripts/eval/skill.ts
- scripts/fixture-smoke.ts
- scripts/pack-smoke.ts
- scripts/pages-review.ts
- src/api/agent-md.ts
- src/api/live.ts
- src/api/paths.ts
- src/api/shiki-langs.ts
- src/cli/args.ts
- src/cli/commands.ts
- src/cli/main.ts
- src/git/diff.ts
- src/git/exec.ts
- src/git/log.ts
- src/git/moved.ts
- src/git/name-status.ts
- src/git/repo.ts
- src/review/coverage.ts
- src/review/digest.ts
- src/review/load.ts
- src/schema/hunk-meta.ts
- src/schema/image.ts
- src/schema/review.ts
- src/schema/skill-sync.ts
- src/schema/source.ts
- src/schema/types.ts
- src/server/http.ts
- src/ui/App.tsx
- src/ui/PierreDiff.tsx
- src/ui/api.ts
- src/ui/components/FileNav.tsx
- src/ui/components/Group.tsx
- src/ui/components/GroupBrief.tsx
- src/ui/components/GroupNav.tsx
- src/ui/components/Header.tsx
- src/ui/components/HunkView.tsx
- src/ui/components/ImageDiff.tsx
- src/ui/components/InlineMd.tsx
- src/ui/components/Inspector.tsx
- src/ui/components/Kbd.tsx
- src/ui/components/Kicker.tsx
- src/ui/components/Logo.tsx
- src/ui/components/MobileShell.tsx
- src/ui/components/Overview.tsx
- src/ui/components/ReadingMark.tsx
- src/ui/components/Sidebar.tsx
- src/ui/components/SourceCite.tsx
- src/ui/components/SourceList.tsx
- src/ui/components/WaitMark.tsx
- src/ui/components/ui/badge.tsx
- src/ui/components/ui/button.tsx
- src/ui/components/ui/sheet.tsx
- src/ui/components/ui/tooltip.tsx
- src/ui/lib/ThemeProvider.tsx
- src/ui/lib/file-nav.ts
- src/ui/lib/group-files.ts
- src/ui/lib/image-stage.ts
- src/ui/lib/load-diff-files.ts
- src/ui/lib/look-for.ts
- src/ui/lib/motion.ts
- src/ui/lib/parts.ts
- src/ui/lib/peek-files.ts
- src/ui/lib/pin-gap-expand.ts
- src/ui/lib/reading-progress.ts
- src/ui/lib/relocation.ts
- src/ui/lib/selection.ts
- src/ui/lib/story-nav.ts
- src/ui/lib/use-viewed-files.ts