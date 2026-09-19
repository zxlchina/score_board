#!/usr/bin/env bash
# 在服务器 /data1/release/tools/score_board/ 下执行
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

mkdir -p data run

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-13001}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export DATABASE_PATH="${DATABASE_PATH:-./data/score.db}"

# 服务器默认 node 可能是 v10，Next.js 15 需要 Node 18+
if [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm use 20 >/dev/null 2>&1 || nvm use 18 >/dev/null 2>&1 || true
fi

if command -v pm2 >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
  if pm2 describe scoreboard-jifenban >/dev/null 2>&1; then
    pm2 delete scoreboard-jifenban >/dev/null 2>&1 || true
  fi
  pm2 start server.js \
    --name scoreboard-jifenban \
    --cwd "$APP_DIR" \
    --interpreter "$NODE_BIN" \
    --update-env
  pm2 save || true
  exit 0
fi

PID_FILE="$APP_DIR/run/scoreboard.pid"
if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE")"
  if kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" || true
    sleep 1
  fi
fi

nohup node server.js >> run/server.log 2>&1 &
echo $! > "$PID_FILE"
echo "started pid $(cat "$PID_FILE") on port ${PORT}"
