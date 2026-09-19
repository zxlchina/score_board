#!/bin/bash
# 在服务器上以 root 执行：bash fix-nginx-score_board.sh
set -euo pipefail

CONF=/etc/nginx/sites-enabled/lichzhang.net.conf
cp "$CONF" "/root/lichzhang.net.conf.bak.$(date +%Y%m%d%H%M%S)"
grep -v '^\*\*' "$CONF" > /tmp/nginx.tmp

python3 << 'PY'
import re
from pathlib import Path

path = Path("/tmp/nginx.tmp")
text = path.read_text()

# 删除旧「积分计分板」注释块
text = re.sub(
    r"\n    # 积分计分板[^\n]*\n(?:    .*\n)*?    \}\n",
    "\n",
    text,
)

# 删除 location ^~/tools { ... }（不含 score_board）
text = re.sub(
    r"\n    location \^~/tools \{\n(?:    .*\n)*?    \}\n",
    "\n",
    text,
)

text = re.sub(
    r"\n    location = /tools \{\n(?:    .*\n)*?    \}\n",
    "\n",
    text,
)

snippet = """
    # 积分计分板 (Next.js @13001)
    location ^~/tools/score_board {
        proxy_pass http://127.0.1.1:13001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

"""

marker = "    # 游戏中心统一后台 API"
if "tools/score_board" not in text:
    if marker not in text:
        raise SystemExit("marker not found in nginx config")
    text = text.replace(marker, snippet + marker)

path.write_text(text)
PY

cp /tmp/nginx.tmp "$CONF"
rm -f /etc/nginx/sites-enabled/*.bak.*
nginx -t
systemctl reload nginx
echo NGINX_OK
