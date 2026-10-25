Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 7346f9664030764a93e78942373251c29a5f4803` and `git rev-parse --verify a476ce89308f686f4349f0c94cb750a094e8b51b` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  7346f9664030764a93e78942373251c29a5f4803

head               a476ce89308f686f4349f0c94cb750a094e8b51b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 7346f9664030764a93e78942373251c29a5f4803 a476ce89308f686f4349f0c94cb750a094e8b51b

Commits:
- a476ce8 Support Windows and PowerShell in the CLI and skill

Sources:
- transcript Claude Code session · Oct 25 Make the skill and CLI work on Windows (PowerShell) without hurting Linux and macOS (bash, zsh); agents detect their shell and adapt.
- commit Support Windows and PowerShell in the CLI and skill

The title:

Support Windows and PowerShell in the CLI and skill

The why:

The skill and the CLI must work on Windows in PowerShell, and stay as good on Linux and macOS in bash and zsh. Agents must find out which shell they run in [and adapt](source:s1).

The what (medium):

The CLI accepts Windows paths and the files PowerShell writes, the repo checks out with LF on every OS, and the skill gets PowerShell blocks plus a shell check. Separately, the API runs its independent git reads in parallel.

Look for:
- Breaking: the published skill in `skills/comprehende/` and the npm `comprehende@0.11.0` CLI still have the Windows `serve` bug. Windows users get the fix only after a release and `pnpm release:skill`.

## Review concerns

### 01 serve accepts Windows paths (`serve-paths`)

`resolveInsideRoot` in `src/git/repo.ts` compares the resolved path against the root plus the platform separator instead of `/`.

[groups/serve-paths.md](groups/serve-paths.md)

### 02 Read review.json in PowerShell encodings (`encodings`)

`loadDocument` reads bytes and `decodeText` picks UTF-16LE from its BOM, else UTF-8 with the BOM dropped; the test writes all three encodings.

Depends on:
- 01 serve accepts Windows paths (`serve-paths`)

[groups/encodings.md](groups/encodings.md)

### 03 LF checkout and slash keys on every OS (`line-endings`)

`.gitattributes` pins LF; `skill-sync.ts` keys its file maps with `/`, so the working tree and the staged tree compare equal; the pages test clones with `core.autocrlf=false`; CONTRIBUTING explains the `.claude/skills` symlink on Windows.

Depends on:
- 01 serve accepts Windows paths (`serve-paths`)

[groups/line-endings.md](groups/line-endings.md)

### 04 Tests and fixture output run on Windows (`test-portability`)

The three `commands.test.ts` tests that count git calls through a bash shim skip only on win32, `vite.config.ts` raises the timeout only on win32, and `build-fixture.ts` prints forward-slash paths.

Depends on:
- 01 serve accepts Windows paths (`serve-paths`)

[groups/test-portability.md](groups/test-portability.md)

### 05 Skill detects the shell and has PowerShell blocks (`skill-shells`)

SKILL.md names bash, zsh, or PowerShell, and points a PowerShell agent at `references/powershell.md`, which replaces the blocks of Workflow steps 2 and 4 and of Refresh; README states the supported shells.

Depends on:
- 02 Read review.json in PowerShell encodings (`encodings`)

[groups/skill-shells.md](groups/skill-shells.md)

### 06 Synced agent skill copy (`skill-copy`)

Generated output of `pnpm sync:skill`, the same text as `skills-next/comprehende`; skip it.

Depends on:
- 05 Skill detects the shell and has PowerShell blocks (`skill-shells`)

[groups/skill-copy.md](groups/skill-copy.md)

### 07 Independent git reads run in parallel (`parallel-git`)

`openReview` in `live.ts` starts coverage, comment pins, commits, repo identity, and the previous review together; `readDiff` resolves base and head together; `staleCommentPins` checks every pin at once.

[groups/parallel-git.md](groups/parallel-git.md)