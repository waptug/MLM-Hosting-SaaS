#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_ENV_FILE="$ROOT_DIR/.deploy.env"
if [[ -f "$DEPLOY_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV_FILE"
fi

: "${DEPLOY_SSH_USER:?Set DEPLOY_SSH_USER in .deploy.env}"
: "${DEPLOY_SSH_HOST:?Set DEPLOY_SSH_HOST in .deploy.env}"
: "${DEPLOY_REMOTE_DIR:?Set DEPLOY_REMOTE_DIR in .deploy.env}"

DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
DEPLOY_GIT_BRANCH="${DEPLOY_GIT_BRANCH:-main}"
DEPLOY_AUTO_COMMIT="${DEPLOY_AUTO_COMMIT:-1}"
DEPLOY_COMMIT_PREFIX="${DEPLOY_COMMIT_PREFIX:-Deploy}"
DEPLOY_REMOTE_POST_SYNC="${DEPLOY_REMOTE_POST_SYNC:-}"

timestamp="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
release_dir="$ROOT_DIR/.deploy/release-$timestamp"
remote_target="${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}"

echo "Building production artifacts..."
npm run build

rm -rf "$release_dir"
mkdir -p "$release_dir"

echo "Preparing release bundle at $release_dir"
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.deploy/' \
  --exclude '.deploy.env' \
  --exclude '.codex/' \
  --exclude '*.sqlite' \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude 'coverage/' \
  --exclude '*.log' \
  "$ROOT_DIR/" "$release_dir/"

echo "Updating local git metadata..."
if [[ "$DEPLOY_AUTO_COMMIT" == "1" ]]; then
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "${DEPLOY_COMMIT_PREFIX} ${timestamp}"
  fi
fi

echo "Pushing to GitHub..."
git push origin "$DEPLOY_GIT_BRANCH"

echo "Syncing release bundle to ${remote_target}:${DEPLOY_REMOTE_DIR}"
ssh -p "$DEPLOY_SSH_PORT" "$remote_target" "mkdir -p '$DEPLOY_REMOTE_DIR'"
rsync -az --delete -e "ssh -p $DEPLOY_SSH_PORT" "$release_dir/" "$remote_target:$DEPLOY_REMOTE_DIR/"

if [[ -n "$DEPLOY_REMOTE_POST_SYNC" ]]; then
  echo "Running remote post-sync command..."
  ssh -p "$DEPLOY_SSH_PORT" "$remote_target" "cd '$DEPLOY_REMOTE_DIR' && $DEPLOY_REMOTE_POST_SYNC"
fi

echo "Deployment complete."
