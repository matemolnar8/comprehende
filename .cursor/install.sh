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

# The Cloud runtime injects a Node shim at /exec-daemon that shadows nvm in
# every shell (login and non-login), so `node`/`pnpm` would otherwise be the
# runtime's older Node. /usr/local/cargo/bin is on PATH ahead of that shim, so
# link this repo's Node toolchain there to make it win everywhere.
shim_dir="/usr/local/cargo/bin"
node_bin="$(dirname "$(nvm which "$node_version")")"
if [ -d "$shim_dir" ] && [ -w "$shim_dir" ]; then
  for bin in "$node_bin"/*; do
    ln -sf "$bin" "$shim_dir/$(basename "$bin")"
  done
fi

pnpm install --frozen-lockfile
