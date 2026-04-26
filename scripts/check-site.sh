#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://geekzonehosting.ai}"
INTERVAL_SECONDS="${CHECK_SITE_INTERVAL_SECONDS:-30}"
MAX_ATTEMPTS="${CHECK_SITE_MAX_ATTEMPTS:-0}"

open_site() {
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
    return 0
  fi

  if command -v wslview >/dev/null 2>&1; then
    wslview "$URL" >/dev/null 2>&1 &
    return 0
  fi

  if command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Start-Process '$URL'" >/dev/null 2>&1 &
    return 0
  fi

  return 1
}

attempt=1
while :; do
  response="$(curl -sS -L --connect-timeout 10 --max-time 20 -o /tmp/check-site.html -w '%{http_code} %{remote_ip}' "$URL" || true)"
  status_code="${response%% *}"
  remote_ip="${response#* }"

  if [[ "$status_code" == "200" ]]; then
    echo "OK: $URL resolved and returned HTTP 200 from $remote_ip"
    if open_site; then
      echo "Opened the site in your browser."
    else
      echo "Browser helper not available; HTML saved to /tmp/check-site.html"
      sed -n '1,120p' /tmp/check-site.html
    fi
    exit 0
  fi

  echo "Attempt $attempt: $URL returned HTTP ${status_code:-error} from ${remote_ip:-unknown}"
  echo "Waiting ${INTERVAL_SECONDS}s before retry..."

  if [[ "$MAX_ATTEMPTS" != "0" && "$attempt" -ge "$MAX_ATTEMPTS" ]]; then
    echo "Giving up after $attempt attempts."
    exit 1
  fi

  attempt=$((attempt + 1))
  sleep "$INTERVAL_SECONDS"
done
