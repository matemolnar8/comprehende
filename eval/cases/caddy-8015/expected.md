# caddy-8015: httpcaddyfile: new `tls_automate_names` global option

PR #8015 closes issue #7122. It adds one Caddyfile global option and five adapt fixtures. One review comment and one conversation comment each asked for a change, and each added one fixture. The final name came from a naming thread in the conversation comments.

## Story

- Title: the PR title, or a plain line about a global option that manages certificates for names without serving them.
- Why: present, from issue #7122. The issue asks for a Caddyfile way to automate a certificate without an HTTPS site, for a wildcard with no site block and for names that only a layer 4 app serves.
- Size: small. The Go change is about 100 lines in two files. The five fixtures are long JSON, but each pins one case.
- Parts: 0 or 1. One story.
- Groups: 1 or 2. The fixtures sit with the code, or in one trailing group.

## Groups

1. Option and tls app: `caddyconfig/httpcaddyfile/options.go` and `caddyconfig/httpcaddyfile/tlsapp.go`. `parseOptAutomateNames` fills the name list, and `buildTLSApp` reads it to write the `automate` loader and the automation policies.
2. Adapt fixtures: the five `caddytest/integration/caddyfile_adapt/tls_automate_names*.caddyfiletest` files. They are generated adapt outputs that pin one case each: the issue scenario, no site blocks, internal names with a repeated option, a name with its own site policy, and `auto_https off`. They can also sit in group 1.

## Must

- Public names with no policy of their own get a new automation policy only when a global automation or ACME option such as `email` is set, because the global issuer is filled in only on policies that exist.
- A listed name that is already a subject of an automation policy keeps that policy and stays in the `automate` loader, as the review comment asks.
- The `tls_automate_names` block is not gated on `auto_https off` or `disable_certs`, so a listed name is still managed when `auto_https` is off.
- The PR body lists three adapt tests, but head has five, because the `existing_policy` and `auto_https_off` fixtures came after review.

## Good

- Each name in `tls_automate_names` goes into the tls app `automate` loader, so Caddy manages its certificate with no site block and no HTTP route for that name.
- `tls_automate_names_without_site_block` and `tls_automate_names_auto_https_off` hold only the `automate` loader and no automation policy, because they set no global option.
- All five fixtures match the code at head.
- In `tls_automate_names.caddyfiletest`, the new policy for `*.example.com` gets the same issuers as the `foo.example.com` site policy, so `consolidateAutomationPolicies` folds both into one policy.
- Repeating the option appends to the list, because `parseOptAutomateNames` appends to the `existing` value.
- Names that cannot get a public certificate, such as `localhost` and `192.168.1.5`, go into `internalAP` and get the internal issuer.
- `hasGlobalACMEDefaults` counts `email`, unlike the check inside `newBaseAutomationPolicy`, so `email` alone is enough to create the policy for listed public names.

## Must not

- Do not state that the PR adds three adapt tests, because head has five.
- Do not ask for documentation in this diff, because the docs live in caddyserver/website#570, outside this repo.
- Do not state that `auto_https off` stops Caddy from managing the listed names.
- Do not write a group attention that asks for more adapt fixtures, a docs page, or a merge of `hasGlobalACMEDefaults` with the check in `newBaseAutomationPolicy`.
- Do not write a group question that asks why the listed names stay managed under `auto_https off`, or why a name with its own site policy gets no second policy, because the author's conversation comments give those reasons.

## Notes

The fixture check is `Good`: it needs each JSON output traced against `buildTLSApp`, including the issuer fill-in and the consolidation further down the function. Past runs missed it in 22 of 23 runs. The `auto_https off` claim is `Must`: the fixture shows `"automatic_https": {"disable": true}` next to the `automate` loader, and the conversation comment says the override is deliberate.

The policy claim does not rest on a dropped catch-all policy, though the code comment and the PR body say so. With only `email` set, `newBaseAutomationPolicy` ignores `email`, so no catch-all policy is built. Without a policy of their own, the names are in no policy, and the loop that fills in global issuers reaches only existing policies.

The review comment asks to reuse the existing policy and to add a regression. The reason, that a second policy for the same subject fails the adapt, comes from the author's conversation comment.

The PR body says it has three adapt tests. Commits `cef01482` and `6c550517` add the other two after review. This is a test count that differs at head, so the skill puts it in `lookFor`.

The PR body says a name with a site block "stays listed here". That is true at head: the name stays in the loader, and only the extra policy is skipped.

`parts` allows 0 or 1, since one story may or may not get a named part. `groups` allows 1 to 3 around the 2 group estimate. `size` allows small or medium, since the fixture JSON can read as more work than it is. `mechanicalPaths` holds the five fixtures, so one group holds all of them. `together` holds the two Go files. No `apart`: with one story, no pair of paths must stay apart.

Homes: the stale test count is a document `lookFor` bullet. The other three Must claims live in the group 1 summary, a file note, or an attention. The `auto_https off` override can be a `product` attention, but the conversation comment already settles it, so a summary fact is enough. No case item asks for an attention.
