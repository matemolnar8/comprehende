# caddy-8015: New tls_automate_names global option

PR #8015 closes issue #7122. It adds one global option plus five adapt fixtures. Review comments shaped two of the fixtures. The PR body discloses AI assistance.

## Story

- Title: the PR title.
- Why: present, from #7122. The issue asks to manage a cert without serving the name. It names two uses: a wildcard with no site block, and certs where Caddy serves no HTTPS at all.
- Size: small. The Go change is about 100 lines. The five fixtures are long JSON, but each pins one behavior, so the burden stays small.
- Parts: 0 or 1. Groups: 1 or 2. The fixtures may sit with the implementation in one group or in a trailing group.

## Groups

1. Option and tls app: `caddyconfig/httpcaddyfile/options.go` and `caddyconfig/httpcaddyfile/tlsapp.go`. The parser fills the name list. The tls app writes the loader and the policy.
2. Adapt fixtures: the five `.caddyfiletest` files in `caddytest/integration/caddyfile_adapt/`. These are generated outputs, checked by hand. The summary says the reader can skip the JSON. Each fixture pins one case: the issue scenario, no site blocks, internal names with a repeated option, the kept policy, and auto_https off.

## Must state

- all five adapt fixtures match the implementation, including the outputs with only the automate loader and no policy. The main fixture folds the wildcard into the same policy a site block would make.
- tls_automate_names still manages a listed name when auto_https is off, as the auto_https off fixture pins. The block is not gated on the general switch, since a named subject is the stronger signal.
- a listed name that already has a site block policy keeps that policy, and the existing policy fixture pins the boundary. A second policy naming the same subject would fail the adapt with an overlap error.

## Good to state

- Repeating the option appends to the list instead of replacing it. So a long list can split over lines.
- Names that cannot get a public cert get the internal issuer, the same as a site block.
- The helper is a pure move of the old inline check. It now serves both the fill in pass and the new policy choice.

## Must not

- Do not split options.go from tlsapp.go. The parser only fills the list. The tls app reads it.
- Do not make one group per fixture. The five outputs sit in one trailing group.
- Do not repeat the AI disclosure as a finding. The PR discloses it. The outputs match the code.
- Do not ask for website docs in this diff. The docs live in website#570, outside this repo.

## Baseline

- First musecode run: 1 group holding everything, parts 0, size small, claims 2 of 3. The single group shape is allowed, so size widened to small.
- Second musecode run: same shape, still 2 of 3 claims. The missed meta match claim stays.
- Third musecode run: 2 groups in the estimated shape, parts 0, size small, claims 2 of 3.

## case.json

- `why` present. Issue #7122 names the one story.
- `parts` 0 to 2 around the one story estimate. 0 allows a review with no named parts.
- `groups` 1 to 3 around the 2 group estimate. 1 allows the fixtures folded into the implementation.
- `size` small to medium around the small estimate.
- `sourceKinds` ticket, pr, and pr-comment. The issue, the PR body, and the review thread all shape the review.
- `mechanicalPaths`: the five fixtures. One trailing group holds them all.
- `together`: options.go with tlsapp.go. The parser fills the list the tls app reads.
- `claims`: the three Must state sentences, word for word.
- No `apart`. With one story, no pair of paths must stay apart.
