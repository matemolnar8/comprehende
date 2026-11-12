Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 7397a98caabcef2ae34ea2721b6cdf59ebc4bed1` and `git rev-parse --verify 7013656b0c46cb764980c91fea0358e3414ab683` in this repository.
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

base (merge-base)  7397a98caabcef2ae34ea2721b6cdf59ebc4bed1

head               7013656b0c46cb764980c91fea0358e3414ab683

Named refs at pin: 7397a98c ... origin/t3/modern-web-fixes

Read the diff:

git diff --find-renames 7397a98caabcef2ae34ea2721b6cdf59ebc4bed1 7013656b0c46cb764980c91fea0358e3414ab683

Commits:
- 7013656b UI: stub motion test globals with vi and cover reduced motion
- 92e8f771 UI: ignore Enter repeats on citations; let the nav label take no selection
- aa7b6712 UI: make citations, the mobile sheet, the theme and the tab title work for everyone
- d32645b3 UI: run the update directly where View Transitions are missing

Sources:
- pr PR #203 Audit fixes a council kept as small and safe.
  https://github.com/matemolnar8/comprehende/pull/203
- transcript Claude Code session · Nov 12 Modern-web-guidance audit of src/ui and council triage.

The title:

UI: navigation works without View Transitions, and Enter opens citations

The why:

[PR #203](source:s1) says clicking a group or opening a file did nothing on Firefox ESR 140 and Safari 17.

The what (small):

Six small UI fixes from a web-guidance audit: navigation, citations, mobile sheet, tab title, theme, and scroll.

Things to check:
- The [audit](source:s2) asked to render in-review citations as `HashLink` and URL citations as `<a>`. `SourceCite` keeps the `<span>` and adds an Enter handler, because citations sit inside group links and a nested link is invalid, as [PR #203](source:s1) says.
- The [audit](source:s2) proposed the title `<view> · <review title> | Comprehende`. `pageTitle` leaves out `| Comprehende`, and no source gives a reason.

## Review concerns

### 01 Guard the View Transition API (`view-transitions`)

`runViewTransition` in `motion.ts` calls `update()` directly when `viewTransitionStart` finds no `startViewTransition`, and the tests in `motion.test.ts` pin that.

[groups/view-transitions.md](groups/view-transitions.md)

### 02 Enter opens a citation (`citations`)

`SourceCite` builds one `cite` action that both click and Enter run, and drops `role="link"` when there is no action.

Attention (tradeoff):
A citation with no action keeps `tabIndex={0}`, so focus still opens its tooltip with the source details. Its click and Enter still call `preventDefault` and `stopPropagation`, so inside a group link they do not follow that link. Both reviewers flagged this as a nit; the PR keeps it to match the click path on `main`.

[groups/citations.md](groups/citations.md)

### 03 Groups button is the sheet trigger (`mobile-sheet`)

`MobileShell` wraps the layout in `Sheet` and makes the Groups button a `SheetTrigger`, so Radix sets its ARIA attributes and returns focus to it on close.

Attention (product):
After the user picks a group in the sheet, `pick` closes it and Radix puts focus back on Groups, not on the new group's content. A keyboard user then tabs through the header again to reach the group. The audit's moves of focus to the new view were deferred.

[groups/mobile-sheet.md](groups/mobile-sheet.md)

### 04 Tab title names the view (`tab-title`)

An effect in `App.tsx` sets `document.title` from `pageTitle` in `selection.ts` whenever `meta` or `selection` changes.

[groups/tab-title.md](groups/tab-title.md)

### 05 Theme applies without storage (`theme-boot`)

The head script in `index.html` reads only `localStorage` inside `try`, so the system theme applies when storage throws; before, the whole theme step was skipped.

[groups/theme-boot.md](groups/theme-boot.md)

### 06 Comment scroll respects reduced motion (`reduced-motion-scroll`)

The scroll to `focusCommentId` in `Group.tsx` uses `instant` when `prefersReducedMotion()` is true, as `useClaimFocus` already does.

[groups/reduced-motion-scroll.md](groups/reduced-motion-scroll.md)