#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_ENV_FILE="$ROOT_DIR/.deploy.env"
if [[ -f "$DEPLOY_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV_FILE"
fi

DEPLOY_TRANSPORT="${DEPLOY_TRANSPORT:-ssh}"

DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-ssh.server1905.mylogin.co}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
DEPLOY_SSH_PASSWORD="${DEPLOY_SSH_PASSWORD:-}"
DEPLOY_PUBLIC_DIR="${DEPLOY_PUBLIC_DIR:-/home/geekzoneai/www}"
DEPLOY_INCLUDE_NODE_MODULES="${DEPLOY_INCLUDE_NODE_MODULES:-1}"
DEPLOY_GIT_BRANCH="${DEPLOY_GIT_BRANCH:-main}"
DEPLOY_AUTO_COMMIT="${DEPLOY_AUTO_COMMIT:-1}"
DEPLOY_COMMIT_PREFIX="${DEPLOY_COMMIT_PREFIX:-Deploy}"
DEPLOY_REMOTE_POST_SYNC="${DEPLOY_REMOTE_POST_SYNC:-}"
DEPLOY_REMOTE_API_PORT="${DEPLOY_REMOTE_API_PORT:-4000}"
DEPLOY_REMOTE_WEB_ORIGIN="${DEPLOY_REMOTE_WEB_ORIGIN:-https://geekzonehosting.ai}"
DEPLOY_REMOTE_API_ORIGIN="${DEPLOY_REMOTE_API_ORIGIN:-http://127.0.0.1:4000}"
DEPLOY_REMOTE_DB_HOST="${DEPLOY_REMOTE_DB_HOST:-127.0.0.1}"
DEPLOY_REMOTE_DB_PORT="${DEPLOY_REMOTE_DB_PORT:-5432}"
DEPLOY_REMOTE_DB_NAME="${DEPLOY_REMOTE_DB_NAME:-geekzoneai_db1}"
DEPLOY_REMOTE_DB_USER="${DEPLOY_REMOTE_DB_USER:-geekzoneai_db1}"
DEPLOY_REMOTE_DB_PASSWORD="${DEPLOY_REMOTE_DB_PASSWORD:-}"
DEPLOY_REMOTE_DB_URL="${DEPLOY_REMOTE_DB_URL:-}"
DEPLOY_REMOTE_SESSION_SECRET="${DEPLOY_REMOTE_SESSION_SECRET:-}"

DEPLOY_FTP_HOST="${DEPLOY_FTP_HOST:-}"
DEPLOY_FTP_PORT="${DEPLOY_FTP_PORT:-21}"
DEPLOY_FTP_USER="${DEPLOY_FTP_USER:-}"
DEPLOY_FTP_PASSWORD="${DEPLOY_FTP_PASSWORD:-}"
DEPLOY_FTP_PROTOCOL="${DEPLOY_FTP_PROTOCOL:-ftp}"
DEPLOY_FTP_PUBLIC_DIR="${DEPLOY_FTP_PUBLIC_DIR:-/}"

timestamp="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
release_dir="$ROOT_DIR/.deploy/release-$timestamp"

if [[ -z "$DEPLOY_REMOTE_DB_URL" && -n "$DEPLOY_REMOTE_DB_PASSWORD" ]]; then
  encoded_password="$(python3 - "$DEPLOY_REMOTE_DB_PASSWORD" <<'PY'
from urllib.parse import quote
import sys
print(quote(sys.argv[1], safe=""))
PY
)"
  DEPLOY_REMOTE_DB_URL="postgresql://${DEPLOY_REMOTE_DB_USER}:${encoded_password}@${DEPLOY_REMOTE_DB_HOST}:${DEPLOY_REMOTE_DB_PORT}/${DEPLOY_REMOTE_DB_NAME}"
fi

mkdir -p "$ROOT_DIR/.deploy"

if [[ "$DEPLOY_TRANSPORT" == "ssh" ]]; then
  : "${DEPLOY_SSH_USER:?Set DEPLOY_SSH_USER in .deploy.env}"
  : "${DEPLOY_SSH_HOST:?Set DEPLOY_SSH_HOST in .deploy.env}"
  : "${DEPLOY_REMOTE_DIR:?Set DEPLOY_REMOTE_DIR in .deploy.env}"
fi
if [[ "$DEPLOY_TRANSPORT" == "ftp" ]]; then
  : "${DEPLOY_FTP_HOST:?Set DEPLOY_FTP_HOST in .deploy.env}"
  : "${DEPLOY_FTP_USER:?Set DEPLOY_FTP_USER in .deploy.env}"
  : "${DEPLOY_FTP_PASSWORD:?Set DEPLOY_FTP_PASSWORD in .deploy.env}"
fi
if [[ "$DEPLOY_TRANSPORT" == "sftp" ]]; then
  : "${DEPLOY_SSH_USER:?Set DEPLOY_SSH_USER in .deploy.env}"
  : "${DEPLOY_SSH_HOST:?Set DEPLOY_SSH_HOST in .deploy.env}"
  : "${DEPLOY_REMOTE_DIR:?Set DEPLOY_REMOTE_DIR in .deploy.env}"
fi

SSH_ARGS=(-p "$DEPLOY_SSH_PORT" -o StrictHostKeyChecking=accept-new)

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
  else
    :
  fi
fi

echo "Building production artifacts..."
npm run build

rm -rf "$release_dir"
mkdir -p "$release_dir"

echo "Preparing release bundle at $release_dir"
if [[ "$DEPLOY_INCLUDE_NODE_MODULES" == "1" ]]; then
  rsync -a --delete \
    --exclude '.git/' \
    --exclude '.deploy/' \
    --exclude '.deploy.env' \
    --exclude '.codex/' \
    --exclude '*.sqlite' \
    --exclude '.env' \
    --exclude '.env.*' \
    --exclude 'coverage/' \
    --exclude '*.log' \
    "$ROOT_DIR/" "$release_dir/"
else
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
fi

echo "Updating local git metadata..."
if [[ "$DEPLOY_AUTO_COMMIT" == "1" ]]; then
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "${DEPLOY_COMMIT_PREFIX} ${timestamp}"
  fi
fi

echo "Pushing to GitHub..."
git push origin "$DEPLOY_GIT_BRANCH"

upload_dir_via_ftp() {
  local source_dir="$1"
  local remote_dir="$2"
  local base_remote="ftp://${DEPLOY_FTP_HOST}:${DEPLOY_FTP_PORT}${remote_dir%/}"
  find "$source_dir" -type f | while IFS= read -r file; do
    local rel="${file#$source_dir/}"
    local remote_file="${base_remote}/${rel}"
    curl --fail --silent --show-error ${DEPLOY_FTP_PROTOCOL:+--proto =$DEPLOY_FTP_PROTOCOL} \
      --ftp-create-dirs -u "${DEPLOY_FTP_USER}:${DEPLOY_FTP_PASSWORD}" \
      -T "$file" "$remote_file"
  done
}

upload_dir_via_sftp() {
  local source_dir="$1"
  local remote_dir="$2"
  local batch_file
  batch_file="$(mktemp "$ROOT_DIR/.deploy/sftp-batch.XXXXXX.txt")"
  trap 'rm -f "$batch_file"' RETURN

  {
    printf 'cd %s\n' "$remote_dir"
    find "$source_dir" -mindepth 1 -maxdepth 1 -print0 | while IFS= read -r -d '' entry; do
      if [[ -d "$entry" ]]; then
        printf 'put -r %s %s/\n' "$entry" "$remote_dir"
      else
        printf 'put %s %s/\n' "$entry" "$remote_dir"
      fi
    done
  } >"$batch_file"

  env DISPLAY=none SSH_ASKPASS="$temp_askpass" SSH_ASKPASS_REQUIRE=force setsid -w sftp -b "$batch_file" -P "$DEPLOY_SSH_PORT" -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}"
}

if [[ "$DEPLOY_TRANSPORT" == "ftp" ]]; then
  echo "Uploading web build via FTP to ${DEPLOY_FTP_HOST}:${DEPLOY_FTP_PORT}${DEPLOY_FTP_PUBLIC_DIR}"
  upload_dir_via_ftp "$release_dir/apps/web/dist" "$DEPLOY_FTP_PUBLIC_DIR"
elif [[ "$DEPLOY_TRANSPORT" == "sftp" ]]; then
  echo "Uploading release bundle via SFTP to ${DEPLOY_SSH_HOST}:${DEPLOY_SSH_PORT}${DEPLOY_REMOTE_DIR}"
  upload_dir_via_sftp "$release_dir" "$DEPLOY_REMOTE_DIR"
  echo "Uploading web build via SFTP to public root ${DEPLOY_SSH_HOST}:${DEPLOY_SSH_PORT}${DEPLOY_PUBLIC_DIR}"
  upload_dir_via_sftp "$release_dir/apps/web/dist" "$DEPLOY_PUBLIC_DIR"
elif [[ "$DEPLOY_TRANSPORT" == "ssh" ]]; then
  remote_target="${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}"
  remote_command="mkdir -p '$DEPLOY_REMOTE_DIR' '$DEPLOY_PUBLIC_DIR' && cd '$DEPLOY_REMOTE_DIR' && "
  publish_command="rm -rf '$DEPLOY_PUBLIC_DIR'/* && cp -a '$DEPLOY_REMOTE_DIR/apps/web/dist/.' '$DEPLOY_PUBLIC_DIR/'"

  if [[ -n "$DEPLOY_REMOTE_POST_SYNC" ]]; then
    echo "Running remote post-sync command..."
    remote_command+=" $DEPLOY_REMOTE_POST_SYNC && $publish_command"
  elif [[ -n "$DEPLOY_REMOTE_DB_URL" && -n "$DEPLOY_REMOTE_SESSION_SECRET" ]]; then
    echo "Running default remote post-sync command..."
    remote_command+="env DATABASE_URL='${DEPLOY_REMOTE_DB_URL}' SESSION_SECRET='${DEPLOY_REMOTE_SESSION_SECRET}' TRUSTED_ORIGINS='${DEPLOY_REMOTE_WEB_ORIGIN},${DEPLOY_REMOTE_API_ORIGIN}' WEB_PORT='80' node packages/database/dist/migrate.js && (pkill -f 'node dist/apps/api/src/index.js' || true; nohup env DATABASE_URL='${DEPLOY_REMOTE_DB_URL}' SESSION_SECRET='${DEPLOY_REMOTE_SESSION_SECRET}' TRUSTED_ORIGINS='${DEPLOY_REMOTE_WEB_ORIGIN},${DEPLOY_REMOTE_API_ORIGIN}' WEB_PORT='80' PORT='${DEPLOY_REMOTE_API_PORT}' node apps/api/dist/apps/api/src/index.js >/tmp/mlm-hosting-saas-api.log 2>&1 &) && $publish_command"
  else
    echo "Skipping remote post-sync because DEPLOY_REMOTE_POST_SYNC is empty and remote DB/session values are not set."
    remote_command+="$publish_command"
  fi

  echo "Syncing release bundle to ${remote_target}:${DEPLOY_REMOTE_DIR}"
  rsync_ssh=(ssh -p "$DEPLOY_SSH_PORT" -o StrictHostKeyChecking=accept-new)
  if [[ -n "$DEPLOY_SSH_PASSWORD" ]]; then
    rsync_ssh+=(-o PreferredAuthentications=password -o PubkeyAuthentication=no)
  fi
  if [[ -n "$DEPLOY_SSH_PASSWORD" ]]; then
    env DISPLAY=none SSH_ASKPASS="$temp_askpass" SSH_ASKPASS_REQUIRE=force setsid -w rsync -az --delete -e "${rsync_ssh[*]}" "$release_dir/" "$remote_target:$DEPLOY_REMOTE_DIR/"
  else
    rsync -az --delete -e "${rsync_ssh[*]}" "$release_dir/" "$remote_target:$DEPLOY_REMOTE_DIR/"
  fi

  echo "Running remote post-sync and publishing web artifact on ${remote_target}"
  if [[ -n "$DEPLOY_SSH_PASSWORD" ]]; then
    env DISPLAY=none SSH_ASKPASS="$temp_askpass" SSH_ASKPASS_REQUIRE=force setsid -w ssh -p "$DEPLOY_SSH_PORT" -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no "$remote_target" "$remote_command"
  else
    ssh -p "$DEPLOY_SSH_PORT" "$remote_target" "$remote_command"
  fi
else
  echo "Unknown DEPLOY_TRANSPORT: $DEPLOY_TRANSPORT" >&2
  exit 1
fi

echo "Deployment complete."
