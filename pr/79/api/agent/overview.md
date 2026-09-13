Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 30060c417b8961cba2924a994cf9b6a07213c674` and `git rev-parse --verify 4779db00491f81c01848be0c1a452efe167232e8` in this repository.
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

base (merge-base)  30060c417b8961cba2924a994cf9b6a07213c674

head               4779db00491f81c01848be0c1a452efe167232e8

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 4779db00491f81c01848be0c1a452efe167232e8

Commits:
- 4779db0 Drive UI location from the URL hash

Sources:
- ticket #78 Selection must leave sessionStorage. The hash is the route in serve and in a static export.
  https://github.com/matemolnar8/comprehende/issues/78
- pr PR #79 Closes #78 with a small hash scheme and tests for parse, serialize, and serve versus export URLs.
  https://github.com/matemolnar8/comprehende/pull/79
- transcript Cursor session · Sep 13 Implement #78 on latest main after #75. Keep the hash thin so header and story hops write it too.

The title:

Drive UI location from the URL hash

The why:

[#78](source:s1) asks the UI location to live in the URL hash so serve and export share refresh and shared links.

The what (small):

`parseHash` and `serializeHash` encode the selection. `App` reads and writes `window.location.hash`. The README names the scheme.

Look for:
- [#78](source:s1) asks hash round-trips in serve and export. `urlWithSelection` keeps the path and only changes the hash.
- [#78](source:s1) asks header `[` `]`, story hops, and lookFor jumps to update the hash. `App` writes on every `setSelection`.
- [#78](source:s1) says stop using storage for the route. `readStoredSelection` is gone. Theme and viewed files still use storage.

## Review concerns

### 01 Hash scheme (`hash`)

`parseHash` and `serializeHash` replace JSON sessionStorage. `hashWriteMode` replaces dead hashes and pushes live hops.

[groups/hash.md](groups/hash.md)

### 02 Hash is the route in App (`app`)

`App` restores from `location.hash` on load, writes with `replaceState` or `pushState`, and listens for `hashchange` and `popstate`.

Depends on:
- 01 Hash scheme (`hash`)

[groups/app.md](groups/app.md)

### 03 Serve and export share the hash (`docs`)

The README names the hash strings. The export test checks that serve and export return the same UI shell.

[groups/docs.md](groups/docs.md)