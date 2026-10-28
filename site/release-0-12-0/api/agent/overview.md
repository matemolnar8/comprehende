Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 75bdc0bcb271fdf7c988a1004c039068991c56e6` and `git rev-parse --verify 69c1fc567d28c71ac354b6250d2159ce66820a5a` in this repository.
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

base (merge-base)  75bdc0bcb271fdf7c988a1004c039068991c56e6

head               69c1fc567d28c71ac354b6250d2159ce66820a5a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 75bdc0bcb271fdf7c988a1004c039068991c56e6 69c1fc567d28c71ac354b6250d2159ce66820a5a

Commits:
- 69c1fc5 0.12.0

Sources:
- commit Support Windows and PowerShell in the CLI and skill Adds PowerShell steps to the skill and a reference file for them.

The title:

Release 0.12.0

The what (small):

Releases comprehende 0.12.0. The CLI version and the skill pin move together, and the skill gains a PowerShell reference.

## Review concerns

### 01 CLI version (`version`)

package.json moves the version from 0.11.0 to 0.12.0.

[groups/version.md](groups/version.md)

### 02 Release copy of the skill (`skill-release`)

The release copy of SKILL.md carries the 0.12.0 pin and the wording from the skill source.

[groups/skill-release.md](groups/skill-release.md)

### 03 PowerShell reference (`powershell-reference`)

A new reference file holds the PowerShell variants of the Workflow steps and Refresh.

[groups/powershell-reference.md](groups/powershell-reference.md)

### 04 Skill source copies (`mirrors-1`)

The source and the .agents copy of SKILL.md hold the same edit; read one and skip the other.

[groups/mirrors-1.md](groups/mirrors-1.md)