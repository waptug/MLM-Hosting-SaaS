#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_ENV_FILE="$ROOT_DIR/.deploy.env"
if [[ -f "$DEPLOY_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV_FILE"
fi

INTERVAL_SECONDS="${DEPLOY_WATCH_INTERVAL_SECONDS:-15}"
LAST_SNAPSHOT=""

echo "Watching for changes. Press Ctrl-C to stop."
while true; do
  CURRENT_SNAPSHOT="$(git status --porcelain=v1)"
  if [[ -n "$CURRENT_SNAPSHOT" && "$CURRENT_SNAPSHOT" != "$LAST_SNAPSHOT" ]]; then
    echo "Changes detected. Deploying..."
    bash "$ROOT_DIR/scripts/deploy.sh"
    LAST_SNAPSHOT="$(git status --porcelain=v1)"
  elif [[ -z "$CURRENT_SNAPSHOT" && -n "$LAST_SNAPSHOT" ]]; then
    LAST_SNAPSHOT=""
  fi

  sleep "$INTERVAL_SECONDS"
done
