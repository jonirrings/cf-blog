# Cloudflare 多框架博客系统

一个基于 Cloudflare  Pages + Workers + D1 构建的多框架博客系统，支持五个前端框架切换。

## 🚀 技术架构

### 后端
- **Cloudflare Workers** - 无服务器 API 后端
- **Cloudflare D1** - SQLite 数据库
- **Cloudflare KV** - 缓存和配置存储
- **Hono** - 轻量级 API 框架
- **Drizzle ORM** - TypeScript ORM

### 前端框架
| 框架 | 版本 | 模式 | 目录 |
|------|------|------|------|
| Next.js | 16.2 | SSG | `apps/next-blog/` |
| Nuxt | 3.21 | SSG | `apps/nuxt-blog/` |
| SvelteKit | 2.20 + Svelte 5 | SSG | `apps/svelte-blog/` |
| Astro | 5.3 | SSG | `apps/astro-blog/` |
| SolidStart | 1.2 + Solid 1.9 | SSG | `apps/solid-blog/` |

### 核心功能
- ✅ GitHub OAuth + Passkey + 邮箱密码认证
- ✅ 用户审批和角色管理（Admin/Publisher/Commenter）
- ✅ 评论二级审批机制（用户审批 + 文章审批）
- ✅ 速率限制和 CSRF/XSS 防护
- ✅ Turnstile 人机验证
- ✅ 审计日志
- ✅ 实时在线人数和阅读数
- ✅ 内容导入/导出（Ghost、Markdown、ZIP）
- ✅ 访问统计（爬虫识别、Cloudflare 同步）
- ✅ TipTap 富文本编辑器（5 框架统一）
- ✅ 国际化 i18n（中/英双语，共享翻译包）
- ✅ 认证 UI 共享组件（@cf-blog/auth-ui）

### 各框架完成状态

| 功能 | Next.js | Nuxt | SvelteKit | Astro | SolidStart |
|------|---------|------|-----------|-------|------------|
| 文章列表 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 文章详情 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 登录/注册/待审批 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 管理后台（鉴权+布局） | ✅ | ✅ | ✅ | ✅ | ✅ |
| 文章管理 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 评论管理 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 用户管理 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 站点配置 | ✅ | ✅ | ✅ | ✅ | ✅ |
| TipTap 富文本编辑 | ✅ | ✅ | ✅ | ✅ | ✅ |
| i18n 中英切换 | ✅ | ✅ | ✅ | ✅ | ✅ |
| LanguageSwitcher | ✅ | ✅ | ✅ | ✅ | ✅ |

> ✅ = 完整功能

---

## 📦 快速开始

### 前置要求
- Node.js >= 20
- pnpm >= 9
- Wrangler CLI
- Cloudflare 账号

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置 Cloudflare 资源

#### 创建 D1 数据库

```bash
wrangler d1 create cf-blog-db
```

记录输出中的 `database_id`，更新 `wrangler.toml` 中的 `[[d1_databases]]` 配置。

#### 创建 KV 命名空间

```bash
wrangler kv:namespace create CONFIG_KV
wrangler kv:namespace create CACHE_KV
wrangler kv:namespace create USER_KV
```

记录每个命名空间的 ID，更新 `wrangler.toml` 中的对应配置。

#### 创建 R2 存储桶

```bash
wrangler r2 bucket create cf-blog-images
```

### 3. 配置环境变量

复制 `.env.example` 到 `.dev.vars`：

```bash
cp .env.example .dev.vars
```

编辑 `.dev.vars` 填入你的配置。详细配置说明见 [GitHub Secrets 配置指南](.github/SECRETS.md)。

### 4. 初始化数据库

运行数据库迁移创建表结构：

```bash
# 本地开发
pnpm db:migrate:local

# 生产环境
pnpm db:migrate
```

插入测试数据（可选）：

```bash
# 本地开发
pnpm db:seed

# 生产环境
pnpm db:seed:remote
```

### 5. 启动开发服务器

```bash
# 运行数据库迁移
pnpm db:migrate:local

# 插入种子数据（可选）
pnpm db:seed
```

### 6. 启动开发服务器

```bash
# 启动所有服务（API + 前端）
pnpm dev
```

访问各框架博客：
| 框架 | URL |
|------|-----|
| API | http://localhost:8788/api/health |
| Next.js | http://localhost:8788/next/ |
| Nuxt | http://localhost:8788/nuxt/ |
| SvelteKit | http://localhost:8788/svelte/ |
| Astro | http://localhost:8788/astro/ |
| SolidStart | http://localhost:8788/solid/ |

管理后台：http://localhost:8788/next/admin

测试账号：
- 管理员：admin@example.com
- 发布者：publisher@example.com
- 评论者：commenter@example.com

---

## 🏗️ 部署

### 前置准备

1. **创建 Cloudflare Pages 项目**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 选择 **Workers & Pages** → **Create application** → **Pages**
   - 连接 GitHub 仓库

2. **配置 GitHub Secrets**
   - `CLOUDFLARE_API_TOKEN` - API Token
   - `CLOUDFLARE_ACCOUNT_ID` - Account ID
   
   详见 [GitHub Secrets 配置指南](.github/SECRETS.md)

3. **配置环境变量**
   
   在 Cloudflare Pages Dashboard 中添加以下环境变量：
   - `ENVIRONMENT=production`
   - `SITE_URL=https://your-domain.com`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
   - `JWT_SECRET`
   - 其他必要变量

4. **绑定资源**
   - D1 数据库：`DB`
   - KV 命名空间：`CONFIG_KV`, `CACHE_KV`, `USER_KV`
   - R2 存储桶：`IMAGES_R2`

### 自动部署（推荐）

推送到 `main` 分支自动触发部署：

```bash
git push origin main
```

GitHub Actions 会执行：
1. 安装依赖
2. 运行 lint 和类型检查
3. 运行单元测试
4. 构建所有框架
5. 部署到 Cloudflare Pages

### 手动部署

```bash
# 本地构建
pnpm build

# 部署
wrangler pages deploy dist/ --project-name=cf-blog
```

---

## 📁 项目结构

```
cf/
├── apps/
│   ├── api/              # Hono API 后端
│   │   └── src/
│   │       ├── routes/   # API 路由
│   │       ├── auth/     # 认证模块
│   │       ├── security/ # 安全模块
│   │       └── websocket/# WebSocket 服务
│   │
│   ├── shell/            # Shell 路由层
│   │   └── src/index.ts
│   │
│   ├── next-blog/        # Next.js 博客（完整功能）
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── admin/      # 管理后台
│   │   │   │   ├── auth/       # 认证页面
│   │   │   │   └── post/       # 文章页面
│   │   │   └── components/     # 组件
│   │   └── next.config.js
│   │
│   ├── nuxt-blog/        # Nuxt 博客（基础页面 + 管理后台）
│   │   └── pages/
│   │       ├── admin/    # 管理后台
│   │       └── post/     # 文章页面
│   │
│   ├── svelte-blog/      # SvelteKit 博客（基础页面 + 管理后台）
│   │   └── src/routes/
│   │       ├── admin/    # 管理后台
│   │       └── post/     # 文章页面
│   │
│   ├── astro-blog/       # Astro 博客（基础页面 + 管理后台）
│   │   └── src/pages/
│   │       ├── admin/    # 管理后台
│   │       └── post/     # 文章页面
│   │
│   └── solid-blog/       # SolidStart 博客（基础页面 + 管理后台）
│       └── src/routes/
│           ├── admin/    # 管理后台
│           └── post/     # 文章页面
│
├── packages/
│   ├── db/               # 数据库 Schema 和迁移
│   │   └── src/
│   │       ├── schema.ts # 数据表定义
│   │       └── seed/     # 种子数据
│   │
│   ├── i18n/             # 共享国际化（i18next，中/英）
│   │   └── src/
│   │       ├── translations.ts  # 翻译键和值
│   │       ├── i18n.ts          # i18next 实例
│   │       └── index.ts         # 导出
│   │
│   └── auth-ui/          # 共享认证 UI 组件（React）
│
├── scripts/              # 工具脚本
│   └── seed-db.ts
│
├── .github/
│   └── workflows/        # CI/CD 配置
│       ├── ci.yml
│       └── deploy.yml
│
├── wrangler.toml         # Wrangler 配置
├── package.json          # 根 package.json
└── README.md
```

---

## 🔧 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev                    # 启动所有服务

# 构建
pnpm build                  # 构建所有项目
pnpm build:db               # 构建数据库
pnpm build:all              # 构建所有前端

# 数据库
pnpm db:migrate             # 运行数据库迁移
pnpm db:migrate:local       # 本地迁移
pnpm db:seed                # 插入种子数据
pnpm db:seed:clear          # 清除种子数据
pnpm db:studio              # 打开 Drizzle Studio

# 代码质量
pnpm lint                   # 运行 ESLint
pnpm typecheck              # TypeScript 类型检查

# 部署
pnpm deploy                 # 部署到 Cloudflare Pages
```

---

## 👥 用户角色

| 角色 | 权限 |
|------|------|
| **Admin** | 所有权限，包括用户管理、站点配置 |
| **Publisher** | 创建/编辑/发布文章，管理评论 |
| **Commenter** | 发表评论 |

### 种子数据用户

| 邮箱 | 角色 | 说明 |
|------|------|------|
| admin@example.com | Admin | 管理员账号 |
| publisher@example.com | Publisher | 发布者账号 |
| commenter@example.com | Commenter | 评论者账号 |

---

## 📝 API 端点

### 认证
- `POST /api/auth/github` - GitHub OAuth
- `POST /api/auth/passkey` - Passkey 认证
- `GET /api/auth/session` - 获取当前会话
- `POST /api/auth/logout` - 登出

### 文章
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:id` - 获取文章详情
- `GET /api/posts/slug/:slug` - 根据 slug 获取
- `POST /api/posts` - 创建文章
- `PUT /api/posts/:id` - 更新文章
- `DELETE /api/posts/:id` - 删除文章

### 评论
- `GET /api/comments` - 获取评论列表
- `POST /api/comments` - 创建评论
- `POST /api/comments/:id/approve` - 批准评论
- `POST /api/comments/:id/reject` - 拒绝评论

### 用户
- `GET /api/users` - 获取用户列表
- `PUT /api/users/:id/role` - 更新用户角色
- `PUT /api/users/:id/approve` - 批准用户

### 配置
- `GET /api/config` - 获取站点配置
- `PUT /api/config` - 更新站点配置

---

## 🔒 安全特性

- **速率限制** - 基于 IP 和用户 ID 的速率限制
- **CSRF 防护** - 所有表单提交需要 CSRF Token
- **XSS 防护** - 输入过滤和输出编码
- **Turnstile** - Cloudflare 人机验证
- **审计日志** - 所有敏感操作记录日志

---

## 📊 监控与告警

- 实时在线人数统计（Durable Objects）
- 文章阅读数统计
- 访问趋势分析
- Cloudflare Analytics 集成

---

## 🛠️ 故障排查

### 常见问题

**1. D1 数据库错误**
```bash
# 检查数据库连接
wrangler d1 info cf-blog-db

# 重新运行迁移
pnpm db:migrate:local
```

**2. KV 命名空间未找到**
```bash
# 重新创建 KV
wrangler kv:namespace create CONFIG_KV
```

**3. 构建失败**
```bash
# 清理缓存
rm -rf node_modules/.cache
rm -rf apps/*/dist
rm -rf apps/*/.next

# 重新安装依赖
pnpm install
```

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
