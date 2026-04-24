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
DEPLOY_SSH_PASSWORD="${DEPLOY_SSH_PASSWORD:-}"
DEPLOY_GIT_BRANCH="${DEPLOY_GIT_BRANCH:-main}"
DEPLOY_AUTO_COMMIT="${DEPLOY_AUTO_COMMIT:-1}"
DEPLOY_COMMIT_PREFIX="${DEPLOY_COMMIT_PREFIX:-Deploy}"
DEPLOY_REMOTE_POST_SYNC="${DEPLOY_REMOTE_POST_SYNC:-}"

timestamp="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
release_dir="$ROOT_DIR/.deploy/release-$timestamp"
remote_target="${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}"

mkdir -p "$ROOT_DIR/.deploy"

SSH_ARGS=(-p "$DEPLOY_SSH_PORT" -o StrictHostKeyChecking=accept-new)
RSYNC_SSH_CMD="ssh -o StrictHostKeyChecking=accept-new -p $DEPLOY_SSH_PORT"

temp_askpass=""
cleanup() {
  if [[ -n "$temp_askpass" && -f "$temp_askpass" ]]; then
    rm -f "$temp_askpass"
  fi
}
trap cleanup EXIT

if [[ -n "$DEPLOY_SSH_PASSWORD" ]]; then
  export DEPLOY_SSH_PASSWORD
  if ! command -v sshpass >/dev/null 2>&1; then
    temp_askpass="$(mktemp "$ROOT_DIR/.deploy/askpass.XXXXXX.sh")"
    cat >"$temp_askpass" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "${DEPLOY_SSH_PASSWORD:?}"
EOF
    chmod 700 "$temp_askpass"
    RSYNC_SSH_CMD="env DISPLAY=none SSH_ASKPASS=$temp_askpass SSH_ASKPASS_REQUIRE=force setsid -w ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -p $DEPLOY_SSH_PORT"
  else
    RSYNC_SSH_CMD="sshpass -p '$DEPLOY_SSH_PASSWORD' ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -p $DEPLOY_SSH_PORT"
  fi
fi

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
if [[ -n "$DEPLOY_SSH_PASSWORD" ]]; then
  env DISPLAY=none SSH_ASKPASS="$temp_askpass" SSH_ASKPASS_REQUIRE=force setsid -w ssh "${SSH_ARGS[@]}" "$remote_target" "mkdir -p '$DEPLOY_REMOTE_DIR'"
  rsync -az --delete -e "$RSYNC_SSH_CMD" "$release_dir/" "$remote_target:$DEPLOY_REMOTE_DIR/"
else
  ssh -p "$DEPLOY_SSH_PORT" "$remote_target" "mkdir -p '$DEPLOY_REMOTE_DIR'"
  rsync -az --delete -e "ssh -p $DEPLOY_SSH_PORT" "$release_dir/" "$remote_target:$DEPLOY_REMOTE_DIR/"
fi

if [[ -n "$DEPLOY_REMOTE_POST_SYNC" ]]; then
  echo "Running remote post-sync command..."
  if [[ -n "$DEPLOY_SSH_PASSWORD" ]]; then
    env DISPLAY=none SSH_ASKPASS="$temp_askpass" SSH_ASKPASS_REQUIRE=force setsid -w ssh "${SSH_ARGS[@]}" "$remote_target" "cd '$DEPLOY_REMOTE_DIR' && $DEPLOY_REMOTE_POST_SYNC"
  else
    ssh -p "$DEPLOY_SSH_PORT" "$remote_target" "cd '$DEPLOY_REMOTE_DIR' && $DEPLOY_REMOTE_POST_SYNC"
  fi
fi

echo "Deployment complete."
