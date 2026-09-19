#!/usr/bin/env bash
# 在服务器写入 /tools/ 反代。需要 DEPLOY_SUDO_PASSWORD 或本机可 sudo 的 SSH 会话。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="${DEPLOY_REMOTE:-lichzhang@lichzhang.net}"
PATCH="${ROOT}/scripts/nginx-tools-location.conf"

if [[ ! -f "$PATCH" ]]; then
  echo "missing $PATCH" >&2
  exit 1
fi

scp "$PATCH" "${REMOTE}:/home/lichzhang/nginx-tools-location.conf"

if [[ -z "${DEPLOY_SUDO_PASSWORD:-}" ]]; then
  echo "Run on server (once):"
  echo "  sudo bash -c 'grep -q 13001/tools /etc/nginx/sites-enabled/lichzhang.net.conf || sed -i \"/# 游戏中心统一后台 API/r $(cat "$PATCH" | sed 's/$/\\/' | tr '\n' ' ')\" /etc/nginx/sites-enabled/lichzhang.net.conf'"
  echo "Or: sudo cp ~/lichzhang.net.conf.patched /etc/nginx/sites-enabled/lichzhang.net.conf && sudo nginx -t && sudo systemctl reload nginx"
  exit 0
fi

ssh "$REMOTE" "echo '${DEPLOY_SUDO_PASSWORD}' | sudo -S bash -s" <<'REMOTE'
set -e
CONF=/etc/nginx/sites-enabled/lichzhang.net.conf
if grep -q 'tools/score_board' "$CONF"; then
  echo nginx already has /tools/score_board
  exit 0
fi
if [[ -f /home/lichzhang/lichzhang.net.conf.patched ]]; then
  cp /home/lichzhang/lichzhang.net.conf.patched "$CONF"
else
  echo "missing patched conf on server" >&2
  exit 1
fi
nginx -t
systemctl reload nginx
echo NGINX_RELOAD_OK
REMOTE
