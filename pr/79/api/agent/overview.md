Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 8344a4a460d19d8216fedc94ac71f5c1866aa1a1` and `git rev-parse --verify 975dd4ec32ab0bb3bfd68cc753683e2cefa04430` in this repository.
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

base (merge-base)  8344a4a460d19d8216fedc94ac71f5c1866aa1a1

head               975dd4ec32ab0bb3bfd68cc753683e2cefa04430

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 8344a4a460d19d8216fedc94ac71f5c1866aa1a1 975dd4ec32ab0bb3bfd68cc753683e2cefa04430

Commits:
- 975dd4e Drive UI location from the URL hash

Sources:
- ticket #78 Store UI location in the URL hash for serve and GitHub Pages export. Empty hash keeps the current default. Header, story, and lookFor hops must stay coherent with that hash.
  https://github.com/matemolnar8/comprehende/issues/78

The title:

Drive UI location from the URL hash

The why:

[#78](source:s1) wants the current place in the URL, so share, refresh, Back, and GitHub Pages match `comprehende serve`.

The what (small):

The UI reads and writes `window.location.hash`. `#overview`, `#group/<id>`, `#unassigned`, and `#lockfiles` name the place. Empty or unknown hashes fall back to the old default. The first write and a dead hash use `replaceState`. A live hop uses `pushState`. Theme and viewed files stay in sessionStorage. Serve and export still share one UI shell. After rebase onto main, lookFor owner hops, header pager, and story Depends on go through the same selection write.

Look for:
- Share a `#group/<id>` URL. The UI opens that group, not Overview. [#78](source:s1).
- Open a lookFor owner on Overview. The hash must move with that owner. [#78](source:s1).
- Click Next group or press `[` / `]`. The hash must change. Back must return. [#78](source:s1).
- Reload a GitHub Pages export on `#group/<id>`. The group must still be selected. [#78](source:s1).

## Review concerns

### 01 Hash is the stored place (`hash`)

`parseHash` and `serializeHash` map the four selection kinds to `#overview`, `#group/<id>`, `#unassigned`, and `#lockfiles`. Group ids are encoded. `selectionFromHash` returns the old default for empty or unknown hashes. `hashWriteMode` skips a no-op, replaces the first write and a dead hash, and pushes a live hop. Tests cover parse, serialize, serve vs Pages URLs, `[` / `]` push, and lookFor owner hops to `#group/login` or `#overview`.

[groups/hash.md](groups/hash.md)

### 02 App reads and writes the hash (`app`)

`restoreSelection` now takes `window.location.hash`. A layout effect writes the hash with `history.replaceState` or `history.pushState`. `hashchange` and `popstate` call `selectFromNav`, so Back also clears lookFor highlight. `openLookFor` and `openSource` still call `selectWithMotion`, so lookFor, source, header pager, story Depends on, and `[` / `]` all write the hash.

Depends on:
- 01 Hash is the stored place (`hash`)

[groups/app.md](groups/app.md)

### 03 README names the hashes; export stays one shell (`docs`)

README lists `#overview`, `#group/<id>`, `#unassigned`, and `#lockfiles`. The export test still asserts that serve and export return the same `index.html`.

[groups/docs.md](groups/docs.md)