#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REMOTE="${DEPLOY_REMOTE:-lichzhang@lichzhang.net}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/data1/release/tools/score_board}"
BASE_PATH="${NEXT_BASE_PATH:-/tools/score_board}"

echo "==> build (NEXT_BASE_PATH=${BASE_PATH})"
NEXT_BASE_PATH="$BASE_PATH" npm run build

echo "==> rsync to ${REMOTE}:${REMOTE_DIR}/"
ssh "$REMOTE" "mkdir -p '${REMOTE_DIR}/data' '${REMOTE_DIR}/run' '${REMOTE_DIR}/scripts'"

rsync -avz --delete \
  --exclude 'data/' \
  --exclude '.env' \
  --exclude 'run/' \
  "${ROOT}/.next/standalone/" "${REMOTE}:${REMOTE_DIR}/"

rsync -avz \
  "${ROOT}/.next/static/" "${REMOTE}:${REMOTE_DIR}/.next/static/"

rsync -avz \
  "${ROOT}/public/" "${REMOTE}:${REMOTE_DIR}/public/"

rsync -avz \
  "${ROOT}/drizzle/" "${REMOTE}:${REMOTE_DIR}/drizzle/"

rsync -avz \
  "${ROOT}/package.json" "${ROOT}/package-lock.json" \
  "${REMOTE}:${REMOTE_DIR}/"

ssh "$REMOTE" "mkdir -p '${REMOTE_DIR}/scripts'"
if ! rsync -avz "${ROOT}/scripts/restart.sh" "${REMOTE}:${REMOTE_DIR}/scripts/restart.sh"; then
  echo "==> rsync restart.sh failed, trying scp"
  scp "${ROOT}/scripts/restart.sh" "${REMOTE}:${REMOTE_DIR}/scripts/restart.sh"
fi

echo "==> install Linux native deps on server"
ssh "$REMOTE" "bash -lc 'export NVM_DIR=\"\$HOME/.nvm\"; . \"\$NVM_DIR/nvm.sh\"; nvm use 20; cd \"${REMOTE_DIR}\" && npm install --omit=dev'"

echo "==> restart remote process"
ssh "$REMOTE" "chmod +x '${REMOTE_DIR}/scripts/restart.sh' && '${REMOTE_DIR}/scripts/restart.sh'"

if [[ -n "${DEPLOY_SUDO_PASSWORD:-}" ]]; then
  echo "==> apply nginx /tools/score_board proxy (DEPLOY_SUDO_PASSWORD set)"
  bash "${ROOT}/scripts/apply-nginx.sh"
else
  echo "==> skip nginx (set DEPLOY_SUDO_PASSWORD to auto-apply scripts/apply-nginx.sh)"
fi

echo "==> done: https://lichzhang.net${BASE_PATH}/"
