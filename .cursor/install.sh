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
pnpm install --frozen-lockfile
