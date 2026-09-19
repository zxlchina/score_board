# 部署补充（Docker / 反代）

**日常发布请以 [部署.md](../部署.md) 为准。**

| 项 | 值 |
|----|-----|
| 对外 URL | https://lichzhang.net/tools/score_board/ |
| 线上目录 | `/data1/release/tools/score_board/` |
| 本机监听 | `127.0.1.1:13001` |
| 构建变量 | `NEXT_BASE_PATH=/tools/score_board` |

Nginx 仅反代 `^~/tools/score_board`，勿占用整个 `/tools/`。
