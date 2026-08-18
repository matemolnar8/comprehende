#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for comprehende.
# Pins the Node version the repo requires (.nvmrc / package.json engines) via nvm,
# then installs dependencies with the pinned pnpm from package.json (via corepack).
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

node_version="$(tr -d '[:space:]' < .nvmrc)"
nvm install "$node_version"
nvm alias default "$node_version"
nvm use default

corepack enable

# The Cloud runtime pre-seeds nvm's bin dir behind its own Node shim (/exec-daemon)
# on PATH, so nvm leaves it there and the shim's older Node wins in the agent's
# shells. Prepend nvm's active bin in ~/.bashrc (which the shells source, after
# nvm is loaded and NVM_BIN is set) so the pinned Node wins. Version-agnostic and
# idempotent.
bashrc="$HOME/.bashrc"
marker="# comprehende: prefer nvm's Node over the runtime Node shim"
if [ -f "$bashrc" ] && ! grep -qF "$marker" "$bashrc"; then
  {
    echo ""
    echo "$marker"
    echo '[ -n "${NVM_BIN:-}" ] && export PATH="$NVM_BIN:$PATH"'
  } >> "$bashrc"
fi

pnpm install --frozen-lockfile
