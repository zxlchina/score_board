# 技术方案

> 与 [REQUIREMENTS.md](./REQUIREMENTS.md) 配套。  
> 生产部署见根目录 [部署.md](../部署.md) 与 [DEPLOY.md](./DEPLOY.md)（**lichzhang.net** `/tools/`）。

## 架构原则

| 原则 | 说明 |
|------|------|
| **必须有服务端** | 业务逻辑、鉴权、数据库访问均在服务器进程内完成，不依赖「纯静态站 + 浏览器直连数据库」 |
| **自托管** | 计划部署在 **lichzhang.net** 自有服务器；数据与 SQLite/DB 文件落在服务器持久化目录 |
| **游客只读 API** | 公开 GET 接口；所有写操作经管理员 Session 校验 |
| **单进程可运维** | MVP 优先一个 Docker 容器跑 Web + API，降低运维成本 |

## 推荐栈（MVP）

| 层 | 选型 | 理由 |
|----|------|------|
| 运行时 | **Node.js 20 LTS** | 与常见 VPS 环境一致，长期跑进程 |
| 应用 | **Next.js（App Router，`output: 'standalone'`）** | 同一服务提供页面 SSR/路由 + `/api/*`；适合自建机 `node server.js` 或 Docker |
| 数据 | **SQLite + Drizzle 或 Prisma** | 单文件库、易备份；数据目录挂载到宿主机卷 |
| 鉴权 | `ADMIN_PASSWORD` + **HttpOnly Session Cookie**（如 iron-session / 自建 signed cookie） | 符合单管理员口令方案；Cookie `Secure` + `SameSite` 生产必开 |
| 反向代理 | 宿主机 **Caddy 或 Nginx** | 终结 TLS，反代到容器内 `3000` |

> 若后续要拆前后端：可演进为 **Hono/Fastify API 服务 + 独立前端**，但 MVP 不强制拆分，避免两套部署。

## 服务端职责（必须实现）

```
┌─────────────┐     HTTPS      ┌──────────────────┐
│   浏览器     │ ──────────────► │ Caddy/Nginx      │
│ 游客 / 管理  │                 │ lichzhang.net    │
└─────────────┘                 └────────┬─────────┘
                                         │ HTTP
                                         ▼
                                ┌──────────────────┐
                                │ Node 应用进程     │
                                │ · 页面渲染        │
                                │ · /api 路由       │
                                │ · Session 校验    │
                                │ · 积分/汇总逻辑   │
                                └────────┬─────────┘
                                         │
                                         ▼
                                ┌──────────────────┐
                                │ SQLite（持久卷）  │
                                └──────────────────┘
```

- **禁止**：管理口令、DB 连接串、写接口仅在前端校验而无服务端拦截。
- **推荐**：敏感配置仅通过服务器环境变量注入（见 DEPLOY.md）。

## 仓库目录（规划）

```
score_board/
  app/                    # Next.js 页面
    (public)/             # 游客 UI
    admin/                # 管理 UI
    api/                  # Route Handlers（REST）
  lib/
    db/                   # schema、migrate、seed
    auth/                 # session、requireAdmin()
    services/             # 录入校验、总积分查询
  data/                   # 本地开发用 SQLite（gitignore）；生产用卷挂载路径
  Dockerfile
  docker-compose.yml      # 含 volume: ./data 或命名卷
  docs/
```

## API 轮廓

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/children` | 公开 | 启用中的小朋友 + 总积分 |
| GET | `/api/children/:id` | 公开 | 详情 + 总积分 |
| GET | `/api/children/:id/records` | 公开 | 明细分页，`?type=reward\|deduct` |
| POST | `/api/admin/login` | 公开 | 校验口令，写 session |
| POST | `/api/admin/logout` | 管理员 | 清除 session |
| GET/POST/PATCH | `/api/admin/children` | 管理员 | 列表、新增、停用等 |
| GET/POST/PATCH | `/api/admin/categories` | 管理员 | 分类维护 |
| POST | `/api/admin/records` | 管理员 | 新增积分变动 |

写路由统一在 Handler 入口调用 `requireAdmin()`；未登录返回 **401**。

## 实现顺序

1. DB schema + migration + 默认分类 seed  
2. 公开只读 API + 游客页面  
3. 登录 / session + 管理写 API  
4. 管理端 UI（小朋友、分类、录入）  
5. Dockerfile + compose + [DEPLOY.md](./DEPLOY.md) 在 staging 域名验证  
6. 对照 REQUIREMENTS §10 验收  

## 待决（实现前拍板）

- [ ] 包管理器：pnpm（推荐）或 npm  
- [ ] Session 库：iron-session vs lucia（轻量即可）  
- [ ] UI：shadcn/ui 或极简 CSS  
- [ ] 对外 URL：子域名（如 `score.lichzhang.net`）或路径前缀（部署时在 DEPLOY 中固定）  
