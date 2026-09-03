---
name: vibedrop
description: Deploy static sites and build output to a shareable URL with VibeDrop. Use when the user asks to share, deploy, publish, host, or preview HTML/CSS/JS, including password-protected previews and public Explore submissions.
license: MIT-0
metadata:
  author: VibeDrop
  homepage: https://vibedrop.cc
  version: "1.1.0"
  released: "2026-07-31"
  canonicalUrl: https://vibedrop.cc/skill.md
compatibility: Requires Node.js 18+ and network access to https://api.vibedrop.cc. Free includes 25 MB per site and 20 active sites. Pro includes 50 MB per site, 200 permanent sites, password protection, and optional branding.
---

# VibeDrop — agent-native static hosting

> **Skill v1.1.0 · released 2026-07-31.** Refetch
> <https://vibedrop.cc/skill.md> when this copy is more than 7 days old.

VibeDrop hosts static HTML, CSS, JavaScript, and assets at a shareable
`*.vibedrop.site` URL. No account or credit card is required for the first
deploy: the CLI provisions an anonymous API key automatically.

## Install the CLI

```bash
npm install -g @vibedrop/cli
vibedrop --version
```

Or run a command without installing globally:

```bash
npx -y @vibedrop/cli <command>
```

If Node.js or npm is unavailable, stop and tell the user that Node.js 18+ is
required.

## Build before deploying

Deploy build output, not framework source:

| Stack | Typical deploy directory |
|---|---|
| Vite / Astro / static SvelteKit | `dist/` |
| Next.js static export | `out/` |
| Create React App | `build/` |
| Plain HTML | directory containing `index.html` |

Run the project's documented build command first. Confirm the chosen directory
contains `index.html`; if it does not, identify the correct build output instead
of uploading source such as `src/`, `app/`, or `pages/`.

## Deploy link-only by default

```bash
vibedrop deploy ./dist
```

New sites are **unlisted** by default. Anyone with the URL can visit, but the
site is marked `noindex` and is not shown in Explore. This is the correct
default for previews, drafts, client work, and links intended for specific
people.

After deployment:

1. Return the site URL to the user.
2. If a claim URL is printed, return it too and say that it is one-time and
   valid for one hour.
3. Never print or paste the raw API key. It stays in
   `~/.vibedrop/config.json`.

Generate a replacement claim URL when needed:

```bash
vibedrop claim-url
```

## Public discovery

Only make a site public when the user explicitly asks for public discovery,
search indexing, the Explore gallery, or a public content submission:

```bash
vibedrop deploy ./dist --public
```

Public sites go through content moderation, screenshot generation, and preview
processing before appearing at <https://vibedrop.cc/explore>. Approved public
sites are indexable and do not expire.

To redeploy an existing public site as link-only:

```bash
vibedrop deploy ./dist --slug k9m2p8x7 --unlisted
```

Never publish private, internal, draft, client, or sensitive material to
Explore without explicit user confirmation.

## Password protection

Password protection is a Pro feature. It is suitable for previews that must not
be accessible with only the URL:

```bash
vibedrop deploy ./dist --password "$VIBEDROP_SITE_PASSWORD"
```

Passwords must be 4–128 characters. Password-protected sites are always
unlisted, excluded from Explore, and marked `noindex`; `--password` and
`--public` cannot be combined.

Do not ask the user to paste a site password into a public chat, store it in the
repository, or commit it. Prefer an already-set environment variable or let the
site owner configure the password in <https://app.vibedrop.cc/sites>.

The dashboard can also update or remove password protection later.

## Redeploy at the same URL

Without a slug, every deploy creates a new random URL. To update a site while
keeping its URL:

```bash
vibedrop deploy ./dist --slug k9m2p8x7
```

The slug must belong to the current API key or its linked account. New slugs
are server-generated; callers cannot choose an arbitrary hostname.

## Site lifecycle and account features

- Free unlisted sites use a rolling 30-day inactivity window. Genuine human
  page visits refresh the deadline; crawlers do not.
- Approved public sites and all Pro sites are permanent.
- Claiming an anonymous key attaches that key and all its sites to an account.
- Claimed-site owners can view privacy-friendly traffic analytics, receive
  visitor messages, change visibility, and manage sites in the dashboard.
- Pro owners can additionally password-protect sites and hide VibeDrop
  branding.

VibeDrop does not currently offer user-configurable custom domains or custom
slugs.

## Size and safety rules

- Free: 25 MB per site, 20 active sites.
- Pro: 50 MB per site, 200 sites.
- Prefer one complete deploy over partial uploads.
- If a build is too large, inspect it with `du -sh <dir>/*` and ask the user
  what may be removed or optimized. Do not silently strip files.
- Static files only: no server-side runtime, environment variables, or
  backend functions are hosted.

## MCP alternative

For native tool calls instead of CLI commands:

```bash
claude mcp add vibedrop -- npx -y @vibedrop/mcp
```

The MCP `deploy_site` and `deploy_html` tools support `slug`, `title`,
`visibility` (`unlisted` or `public`), and Pro `password`. Both use the same
backend and safety rules as the CLI.

## Troubleshooting

- `ENOTFOUND api.vibedrop.cc`: check the firewall or VPN.
- `401 Unauthorized`: the local key was revoked. Remove only the VibeDrop
  config file and deploy again to provision a new anonymous key.
- `plan_required`: the requested option, such as password protection, needs a
  Pro key.
- A blank page usually means the source directory was uploaded instead of the
  framework's build output. Rebuild and deploy the directory containing
  `index.html`.

Docs and support: <https://vibedrop.cc> · hello@vibedrop.cc
