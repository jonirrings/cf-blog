# Cloudflare 多框架博客项目规格说明书

> **项目代号**: cf-blog  
> **版本**: 1.5
> **创建日期**: 2026-05-02
> **最后更新**: 2026-05-03
> **目标**: 在 Cloudflare Pages 上搭建博客，使用 Drizzle ORM + D1 数据库，支持 Next.js/Nuxt/SvelteKit/Astro/SolidStart 五框架切换展示，集成自研认证系统
>
> **Phase 1 状态**: 基础架构完成
> **Phase 2 状态**: P0/P1 后端功能 100% 完成，P2 前端框架 100% 完成（五框架功能对齐 + i18n + 认证）

---

## 1. 项目背景与目标

### 1.1 背景
- 展示对三个主流前端框架（Next.js、Nuxt、SvelteKit）的掌握能力
- 向招聘方展示全栈开发能力
- 利用 Cloudflare 免费额度部署（Pages + D1 + Workers）

### 1.2 核心目标
1. **单一域名**：用户通过统一域名访问，URL 路径区分框架
2. **共享数据**：三个框架共享同一 D1 数据库和 Drizzle schema
3. **框架切换**：界面提供切换器，可在三个框架间无缝切换
4. **Monorepo 管理**：单一仓库管理所有代码，便于维护和部署

---

## 2. 技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                      │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Cloudflare Workers (Router)             ││
│  │  /next/*   → Next.js 构建产物                        ││
│  │  /nuxt/*   → Nuxt 构建产物                           ││
│  │  /svelte/* → SvelteKit 构建产物                      ││
│  │  /_shell/* → 框架切换器 UI                           ││
│  └─────────────────────────────────────────────────────┘│
│                           ↓                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │             静态资源目录 (dist/)                      ││
│  │  ├── next/     (Next.js export)                      ││
│  │  ├── nuxt/     (Nuxt generate)                       ││
│  │  ├── svelte/   (SvelteKit adapter-static)            ││
│  │  └── _worker.js (路由逻辑)                           ││
│  └─────────────────────────────────────────────────────┘│
│                           ↓                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Cloudflare D1 Database                  ││
│  │  - posts 表                                          ││
│  │  - authors 表                                        ││
│  │  - tags 表                                           ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 2.2 技术栈选型

| 层级 | 技术 | 说明 |
|------|------|------|
| **路由层** | Cloudflare Workers | URL 前缀路由分发 + Service Binding |
| **API 后端** | Hono | 轻量级 Workers 框架，统一 API 服务 |
| **部署平台** | Cloudflare Pages | 免费额度，支持 Functions |
| **框架 1** | Next.js 16+ | App Router, Static Export |
| **框架 2** | Nuxt 3.x | Nuxt Content, 静态生成 |
| **框架 3** | SvelteKit 2.x | adapter-static |
| **框架 4** | Astro 5.x | Islands Architecture |
| **框架 5** | SolidStart 1.x | Solid 1.9, 静态生成 |
| **ORM** | Drizzle ORM | SQLite 语法，D1 适配 |
| **数据库** | Cloudflare D1 | Serverless SQLite（结构化数据） |
| **缓存** | Cloudflare KV | 网站配置、渲染缓存、用户偏好 |
| **对象存储** | Cloudflare R2 | 图片、文件存储 |
| **状态层** | Cloudflare Durable Objects | Session、实时功能、在线人数 |
| **认证** | 自研认证层 | GitHub OAuth + Passkey (WebAuthn) |
| **密码哈希** | @adobe/hashes | Cloudflare Workers 兼容 |
| **JWT** | jose | Cloudflare 官方推荐 |
| **包管理** | pnpm workspace | Monorepo 依赖管理 |

---

## 3. Monorepo 项目结构

```
cf-blog/
├── apps/
│   ├── router/             # Workers 路由层（轻量）
│   │   ├── src/
│   │   │   └── index.ts    # 路由分发 + Service Binding
│   │   ├── package.json
│   │   └── wrangler.toml
│   │
│   ├── api/                # Hono 后端 API（统一服务）
│   │   ├── src/
│   │   │   ├── index.ts    # Hono 入口
│   │   │   ├── routes/     # API 路由
│   │   │   │   ├── auth.ts      # 认证相关
│   │   │   │   ├── posts.ts     # 文章相关
│   │   │   │   ├── comments.ts  # 评论相关
│   │   │   │   ├── users.ts     # 用户相关
│   │   │   │   ├── config.ts    # 配置相关
│   │   │   │   ├── analytics.ts # 统计相关
│   │   │   │   └── import.ts    # 导入/导出
│   │   │   ├── middleware/ # Hono 中间件
│   │   │   │   ├── auth.ts        # 认证中间件
│   │   │   │   ├── rateLimit.ts   # 速率限制
│   │   │   │   └── validate.ts    # 参数验证
│   │   │   ├── services/   # 业务逻辑
│   │   │   └── utils/      # 工具函数
│   │   ├── package.json
│   │   └── wrangler.toml
│   │
│   ├── next-blog/          # Next.js 应用（纯前端）
│   │   ├── src/
│   │   │   ├── app/        # App Router
│   │   │   ├── components/ # 博客组件
│   │   │   └── lib/        # API 调用封装
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tailwind.config.js
│   │
│   ├── nuxt-blog/          # Nuxt 应用（纯前端）
│   │   ├── components/
│   │   ├── composables/
│   │   ├── pages/
│   │   ├── nuxt.config.ts
│   │   └── package.json
│   │
│   └── svelte-blog/        # SvelteKit 应用（纯前端）
│       ├── src/
│       │   ├── routes/
│       │   ├── lib/
│       │   └── app.html
│       ├── svelte.config.js
│       ├── package.json
│       └── tailwind.config.js
│
├── packages/
│   ├── db/                 # 共享 Drizzle schema
│   │   ├── src/
│   │   │   ├── schema.ts   # 数据库表定义
│   │   │   ├── client.ts   # D1 连接客户端
│   │   │   └── index.ts    # 导出
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── i18n/               # 共享国际化（i18next）
│   │   ├── src/
│   │   │   ├── translations.ts  # 翻译键和值（zh-CN + en）
│   │   │   ├── i18n.ts          # i18next 实例
│   │   │   └── index.ts         # 导出
│   │   └── package.json
│   │
│   ├── auth-ui/            # 共享认证 React 组件
│   │   ├── src/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── GitHubButton.tsx
│   │   │   ├── PasskeyButton.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   └── api-types/          # 共享 API 类型定义
│       ├── src/
│       │   ├── types.ts    # 接口响应类型
│       │   └── index.ts
│       └── package.json
│
├── scripts/
│   ├── build-all.sh        # 构建所有项目
│   └── migrate.sh          # 数据库迁移
│
├── package.json            # Root package.json (workspace)
├── pnpm-workspace.yaml     # pnpm workspace 配置
├── tsconfig.json           # Root TypeScript 配置
└── README.md
```

---

## 4. 数据库设计

### 4.1 用户角色设计

| 角色 | 权限 | 获取方式 |
|------|------|---------|
| **网站管理员 (admin)** | 全部权限：用户管理、角色审批、博客管理、评论审核 | OOBE 阶段初始化（仅首个） |
| **博客发布者 (publisher)** | 创建/编辑/删除文章、管理标签、审核自己文章的评论 | 普通用户申请 → 管理员审批 |
| **评论者 (commenter)** | 发表评论、查看自己的评论、申请成为发布者 | GitHub OAuth 注册默认角色 |

---

### 4.1.1 评论可见性规则

**API 实现**:
- `GET /api/comments/pending` - 获取待审批评论列表
- `POST /api/comments/:id/approve` - 审批通过评论
- `POST /api/comments/:id/reject` - 审批拒绝评论

**技术实现**:
- `userApproveComment()` - 用户审批自己的评论
- `authorApproveComment()` - 文章作者审批评论
- `adminApproveComment()` - 管理员审批评论（同时通过两级）
- `rejectComment()` - 拒绝评论
- `isCommentPublic()` - 检查评论是否公开
- `isCommentVisibleToOwner()` - 检查评论是否对评论者可见
- `isCommentVisibleToAuthor()` - 检查评论是否对作者可见

---

## 7. 安全防御体系

### 7.1 速率限制

**实现位置**: `apps/api/src/security/rateLimit.ts`

**限制策略**:
| 端点 | 限制 |
|------|------|
| API 通用 | 100 次/分钟 |
| 认证相关 | 10 次/分钟 |
| 评论 | 10 次/小时 |
| 上传 | 20 次/小时 |
| 敏感操作 | 5 次/分钟 |

**技术实现**:
- 基于 IP 和用户 ID 进行限制
- 使用 KV 存储请求时间窗口
- 响应头包含 `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 7.2 CSRF 防护

**实现位置**: `apps/api/src/security/csrf.ts`

**防护机制**:
- Double Submit Cookie 模式
- CSRF Token 32 位随机生成
- 定时安全比较防止时序攻击

**使用方法**:
1. GET 请求自动设置 `X-CSRF-Token` 头
2. POST/PUT/DELETE 请求需要在 Header 中携带 `X-CSRF-Token`
3. Cookie 名称：`csrf_token`

### 7.3 XSS 防护

**实现位置**: `apps/api/src/security/sanitize.ts`

**防护机制**:
- HTML 标签白名单过滤
- JavaScript 协议过滤
- 事件处理器过滤
- 评论输入清理

**评论输入验证**:
- 最大长度：1000 字符
- 支持基础 Markdown（粗体、斜体、链接、列表）
- 禁止标题、代码块、图片
- 最多 3 个链接

### 7.4 Turnstile 人机验证

**实现位置**: `apps/api/src/security/turnstile.ts`

**验证端点**:
- 注册/登录
- 发表评论
- 申请成为发布者

**技术实现**:
- Cloudflare Turnstile API
- 支持 Invisible 模式
- IP 地址可选传递

### 7.5 审计日志

**实现位置**: `apps/api/src/security/audit.ts`

**记录操作**:
- 用户创建/审批/拒绝
- 发布者申请审批
- 评论审批/拒绝
- 文章创建/发布/删除
- 登录/登出

**查询功能**:
- 按用户/操作/时间范围查询
- 用户操作历史
- 目标操作历史
- 异常活动检测

| 场景 | 可见范围 |
|------|---------|
| **用户未审批** (isApproved = false) | 仅评论者自己可见 |
| **用户已审批，文章作者未审批** (userApproved = true, postApproved = false) | 评论者自己 + 文章作者可见 |
| **完全审批通过** (userApproved = true, postApproved = true) | 所有人可见 |
| **评论被拒绝** (rejected = true) | 仅评论者自己和管理员可见 |

**审批流程**:
```
用户发表评论
    ↓
自动标记：userApproved = false (新用户) 或 true (已审批用户)
    ↓
【一级审批 - 用户审批】管理员审批用户资质
    ↓
userApproved = true → 进入二级审批
    ↓
【二级审批 - 文章审批】文章作者审批内容
    ↓
postApproved = true → 公开显示
```

---

### 4.1.2 角色升级流程

```
普通用户 (commenter)
    ↓
发起申请：POST /api/users/apply-publisher
    ↓
状态：pending_publisher → 等待审批
    ↓
管理员审批：
  - 同意 → role = 'publisher'
  - 拒绝 → 保持 commenter，记录拒绝原因
```

---

### 4.2 Schema 定义 (`packages/db/src/schema.ts`)

```typescript
import { sqliteTable, text, integer, relations } from 'drizzle-orm/sqlite-core';

// ==================== 认证相关表 ====================

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  githubId: text('github_id').unique(),  // GitHub OAuth ID
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: text('role', { enum: ['admin', 'publisher', 'commenter'] }).notNull(),
  
  // 用户审批状态
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false).notNull(),  // 管理员是否审批通过
  
  // 角色升级申请
  publisherApplicationStatus: text('publisher_application_status', { 
    enum: ['none', 'pending', 'approved', 'rejected'] 
  }).default('none').notNull(),
  publisherApplicationReason: text('publisher_application_reason'),  // 申请理由
  publisherApplicationReviewedAt: text('publisher_application_reviewed_at'),
  publisherApplicationReviewedBy: integer('publisher_application_reviewed_by').references(() => users.id),
  publisherApplicationRejectReason: text('publisher_application_reject_reason'),
  
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  lastLoginAt: text('last_login_at'),
});

export const passkeys = sqliteTable('passkeys', {
  id: text('id').primaryKey(),  // credential ID (base64)
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name'),  // 设备名称，如 "MacBook Pro"
  publicKey: text('public_key').notNull(),  // PEM 格式
  counter: integer('counter').notNull().default(0),  // 防止重放攻击
  createdAt: text('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),  // session token
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),  // 如 'USER_APPROVED', 'COMMENT_REJECTED'
  resource: text('resource').notNull(),  // 如 'user:123', 'comment:456'
  resourceType: text('resource_type').notNull(),  // 'user' | 'comment' | 'post' | 'application'
  resourceId: integer('resource_id').notNull(),
  
  // 上下文信息
  ipAddress: text('ip_address'),  // 请求 IP
  userAgent: text('user_agent'),
  metadata: text('metadata'),  // JSON 字符串，存储额外信息
  
  // 结果
  success: integer('success', { mode: 'boolean' }).notNull(),
  errorMessage: text('error_message'),
  
  timestamp: text('timestamp').notNull(),
});

// ==================== 博客内容表 ====================

export const authors = sqliteTable('authors', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),  // 关联用户
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  createdAt: text('created_at').notNull(),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  status: text('status', { enum: ['draft', 'published'] }).default('draft').notNull(),
  framework: text('framework', { enum: ['next', 'nuxt', 'svelte'] }).notNull(),
  authorId: integer('author_id').references(() => authors.id),
  
  // 访问统计（冗余字段，快速查询）
  viewCount: integer('view_count').notNull().default(0),  // 总阅读数
  uniqueViewCount: integer('unique_view_count').notNull().default(0),  // 独立访客数
  
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  publishedAt: text('published_at'),
});

export const postViews = sqliteTable('post_views', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  
  // 访问者标识（用于去重）
  sessionId: text('session_id').notNull(),  // 前端生成的 UUID
  ipAddress: text('ip_address').notNull(),  // 脱敏存储（哈希）
  userAgent: text('user_agent'),
  
  // 访问来源
  referer: text('referer'),
  country: text('country'),  // Cloudflare CF-IPCountry
  city: text('city'),
  
  // 爬虫标识
  isBot: integer('is_bot', { mode: 'boolean' }).notNull().default(false),
  botType: text('bot_type'),  // 'google', 'bing', 'other', null
  
  // 数据来源
  source: text('source', { enum: ['self', 'cloudflare'] }).notNull().default('self'),
  
  // 时间
  viewedAt: text('viewed_at').notNull(),
});

export const postViewStats = sqliteTable('post_view_stats', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(),  // YYYY-MM-DD
  
  totalViews: integer('total_views').notNull().default(0),
  uniqueViews: integer('unique_views').notNull().default(0),
  botViews: integer('bot_views').notNull().default(0),
  
  uniqueKey('post_id', 'date'),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
});

export const postsToTags = sqliteTable('posts_to_tags', {
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
  primaryKey('post_id', 'tag_id'),
});

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  
  // 二级审批机制
  userApproved: integer('user_approved', { mode: 'boolean' }).default(false).notNull(),  // 管理员审批用户
  postApproved: integer('post_approved', { mode: 'boolean' }).default(false).notNull(),  // 文章作者审批内容
  rejected: integer('rejected', { mode: 'boolean' }).default(false).notNull(),  // 评论被拒绝
  
  // 审批元数据
  userApprovedAt: text('user_approved_at'),
  userApprovedBy: integer('user_approved_by').references(() => users.id),  // 管理员
  postApprovedAt: text('post_approved_at'),
  postApprovedBy: integer('post_approved_by').references(() => users.id),  // 文章作者
  rejectedAt: text('rejected_at'),
  rejectedBy: integer('rejected_by').references(() => users.id),
  rejectReason: text('reject_reason'),
  
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ==================== 关系定义 ====================

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.id],
  }),
  tags: many(postsToTags),
  comments: many(comments),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsToTags),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  passkeys: many(passkeys),
  sessions: many(sessions),
  comments: many(comments),
}));

// ==================== 类型导出 ====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Passkey = typeof passkeys.$inferSelect;
export type NewPasskey = typeof passkeys.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type UserRole = 'admin' | 'publisher' | 'commenter';
export type PublisherApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type PostView = typeof postViews.$inferSelect;
export type NewPostView = typeof postViews.$inferInsert;
export type PostViewStats = typeof postViewStats.$inferSelect;
export type NewPostViewStats = typeof postViewStats.$inferInsert;

// 评论可见性枚举
export type CommentVisibility = 'owner_only' | 'owner_and_author' | 'public' | 'owner_and_admin';

// 审计动作枚举
export type AuditAction = 
  | 'USER_LOGIN'
  | 'USER_REGISTER'
  | 'USER_APPROVED'
  | 'USER_REJECTED'
  | 'USER_ROLE_CHANGED'
  | 'COMMENT_CREATED'
  | 'COMMENT_USER_APPROVED'
  | 'COMMENT_POST_APPROVED'
  | 'COMMENT_REJECTED'
  | 'PUBLISHER_APPLICATION_SUBMITTED'
  | 'PUBLISHER_APPLICATION_APPROVED'
  | 'PUBLISHER_APPLICATION_REJECTED'
  | 'POST_CREATED'
  | 'POST_DELETED';

// 爬虫类型枚举
export type BotType = 'google' | 'bing' | 'baidu' | 'yandex' | 'duckduck' | 'facebook' | 'twitter' | 'linkedin' | 'slack' | 'other' | 'suspected';
```

### 4.3 Drizzle 配置 (`packages/db/drizzle.config.ts`)

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  driver: 'd1',
  dialect: 'sqlite',
} satisfies Config;
```

### 4.4 数据库连接 (`packages/db/src/client.ts`)

```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Workers 环境使用
export function getDb(env: { DB: D1Database }) {
  return createDb(env.DB);
}
```

---

## 5. 评论可见性设计

### 5.1 可见性判断逻辑

```typescript
// 判断评论对当前用户是否可见
function isCommentVisibleTo(
  comment: Comment,
  currentUser: User | null,
  postAuthorId: number
): boolean {
  // 1. 被拒绝的评论：仅评论者自己和管理员可见
  if (comment.rejected) {
    return currentUser?.role === 'admin' || currentUser?.id === comment.userId;
  }
  
  // 2. 未登录用户：不可见任何评论
  if (!currentUser) {
    return false;
  }
  
  // 3. 评论者自己：总是可见自己的评论
  if (currentUser.id === comment.userId) {
    return true;
  }
  
  // 4. 管理员：可见所有评论
  if (currentUser.role === 'admin') {
    return true;
  }
  
  // 5. 文章作者：可见自己文章下的所有评论（用于审批）
  if (postAuthorId === currentUser.id) {
    return true;
  }
  
  // 6. 完全审批通过的评论：所有人可见
  if (comment.userApproved && comment.postApproved) {
    return true;
  }
  
  // 7. 仅通过用户审批：评论者 + 文章作者可见
  if (comment.userApproved && !comment.postApproved) {
    return false; // 文章作者已在上面处理，其他人不可见
  }
  
  // 8. 未审批：仅评论者自己可见（已在上面处理）
  return false;
}
```

### 5.2 评论查询 API

```typescript
// GET /api/posts/:postId/comments
// 返回当前用户可见的所有评论

async function getVisibleComments(postId: number, currentUser: User | null) {
  const comments = await db.query.comments.findMany({
    where: eq(comments.postId, postId),
    with: {
      user: { columns: { id: true, name: true, avatar: true } },
    },
  });
  
  // 获取文章作者 ID（用于可见性判断）
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    columns: { authorId: true },
  });
  
  // 过滤可见评论
  return comments.filter(comment => 
    isCommentVisibleTo(comment, currentUser, post?.authorId)
  );
}
```

### 5.3 评论内容格式规范

| 规则 | 说明 | 技术实现 |
|------|------|----------|
| **最大长度** | 1000 个 UTF-8 字符（支持中文、emoji 等） | `length <= 1000` 校验 |
| **最小长度** | 1 个字符（不允许空评论） | `length >= 1` 校验 |
| **支持的格式** | 基础 Markdown：粗体、斜体、链接、无序列表 | marked.js 解析 + 白名单过滤 |
| **禁止的内容** | 标题（`#`）、代码块（\`\`\`）、HTML 标签、图片 | sanitize 过滤 |
| **链接处理** | 自动添加 `rel="nofollow"` 防止 SEO spam，超过 3 个链接触发审核 | 链接计数校验 |
| **敏感词过滤** | 发表前经过 sanitize 处理，过滤 XSS 和恶意脚本 | DOMPurify |

**示例**：
```markdown
✅ 允许：这是一篇**很好**的文章，强烈推荐 [阅读原文](https://example.com)
✅ 允许：列表项 1、列表项 2（无序列表）
❌ 禁止：`# 标题`（不支持标题语法）
❌ 禁止：\`\`\`js code \`\`\`（不支持代码块）
❌ 禁止：`![img](url)`（不支持图片）
❌ 禁止：`<script>alert(1)</script>`（XSS 过滤）
```

---

## 6. 认证系统设计

### 6.1 认证方式总览

```
┌─────────────────────────────────────────────────────────────────┐
│                      认证方式总览                                │
├─────────────────────────────────────────────────────────────────┤
│  OOBE 管理员设置 → 仅首次访问 /api/auth/onboarding               │
│  GitHub OAuth    → 发布者/评论者 注册和登录                       │
│  Passkey         → 已绑定用户的快速登录                          │
│  Session 管理    → JWT + HttpOnly Cookie                         │
└─────────────────────────────────────────────────────────────────┘
```

**技术实现**:
- **JWT**: `jose` 库进行签名和验证
- **密码哈希**: `@adobe/hashes` Argon2id 算法
- **Session 时长**: 7 天
- **Cookie**: HttpOnly + Secure + SameSite=Lax

### 6.2 OOBE 管理员初始化

**API**: `POST /api/auth/onboarding`

**触发条件**: 首次访问系统，`users` 表为空

**技术实现**:
- 使用 `isOnboardingComplete()` 检查 KV 中的状态
- 使用 `createAdminUser()` 创建管理员
- 使用 Argon2id 哈希密码
- 创建成功后标记 `onboarding_complete = true`

**请求体**:
```json
{
  "email": "admin@example.com",
  "password": "secure_password_123",
  "name": "Administrator"
}
```

**响应**:
```json
{
  "success": true,
  "userId": 1
}
```

**错误处理**:
- 403: OOBE 已完成
- 400: 验证失败（邮箱格式、密码长度等）

### 6.3 GitHub OAuth 流程

**API**: 
- `GET /api/auth/github` - 获取授权 URL
- `GET /api/auth/github/callback` - 回调处理

**技术实现**:
- 使用 `generateState()` 生成 CSRF 防护 state
- State 存储到 KV（5 分钟过期）
- 使用 `handleGitHubCallback()` 处理回调
- 自动创建/更新用户到 D1

**流程**:
```
1. 前端请求 /api/auth/github
2. 后端返回 authUrl 和 state
3. 前端重定向到 GitHub 授权页面
4. 用户授权后回调到 /api/auth/github/callback
5. 后端验证 state，交换 access_token
6. 获取 GitHub 用户信息
7. 创建/更新本地用户
8. 设置 Session Cookie
9. 重定向到前端页面
```

### 6.4 Passkey (WebAuthn) 认证

**API**:
- `POST /api/auth/passkey/register/start` - 生成注册挑战
- `POST /api/auth/passkey/register/finish` - 验证注册响应
- `POST /api/auth/passkey/login/start` - 生成登录挑战
- `POST /api/auth/passkey/login/finish` - 验证登录响应

**技术实现**:
- 使用 `@simplewebauthn/server` 进行验证
- Challenge 存储到 KV（5 分钟过期）
- Passkey 信息存储到 `passkeys` 表

### 6.5 Session 管理

**API**: `GET /api/auth/session`

**技术实现**:
- JWT Token 使用 HS256 算法签名
- Session 信息包含：userId, userName, userRole, isApproved
- Cookie 名称：`cf-blog-session`
- Session 时长：7 天

**权限检查**:
- `isAdmin(session)` - 检查是否为管理员
- `isPublisher(session)` - 检查是否为发布者
- `isApproved(session)` - 检查用户是否已审批

### 6.6 角色权限中间件

**中间件**:
- `authMiddleware` - 需要登录
- `optionalAuthMiddleware` - 可选登录
- `adminMiddleware` - 需要管理员
- `publisherMiddleware` - 需要发布者
- `approvedMiddleware` - 需要已审批用户
- `requireAuth()` - 组合：auth + approved
- `requirePublisher()` - 组合：auth + publisher
- `requireAdmin()` - 组合：auth + admin

**权限检查函数**:
- `canEditPost(session, postAuthorId)` - 检查文章编辑权限
- `canDeletePost(session, postAuthorId)` - 检查文章删除权限
- `canApproveComment(session, postAuthorId)` - 检查评论审批权限

**触发条件**: 首次访问系统，`users` 表为空

**流程**:
```
1. 用户访问 /setup 页面
2. 填写管理员信息 (email, name, password)
3. POST /api/auth/setup-admin
4. 验证 users 表是否为空（防止重复创建）
5. 哈希密码，创建用户，role='admin'
6. 创建 session，重定向到管理后台
7. 永久禁用 /setup 路由
```

**代码位置**: `apps/shell/src/auth/onboarding.ts`

---

### 5.3 GitHub OAuth 流程

**OAuth 配置**:
- 在 GitHub 创建 OAuth App
- Callback URL: `https://your-domain.com/api/auth/github/callback`
- 获取 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`

**流程**:
```
1. 用户点击 "Login with GitHub"
2. 重定向到 GitHub: https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=user:email
3. 用户授权，GitHub 回调 /api/auth/github/callback?code=xxx
4. 用 code 换取 access_token
5. 调用 GitHub API 获取用户信息 (id, email, name, avatar)
6. 查询本地 users 表:
   - 存在 → 更新 lastLoginAt，创建 session
   - 不存在 → 创建新用户 (role='commenter')，创建 session
7. Set-Cookie: session=xxx，重定向到首页
```

**代码位置**: `apps/shell/src/auth/github.ts`

---

### 5.4 Passkey 注册/登录

**依赖**: `@simplewebauthn/server` + `@simplewebauthn/browser`

#### Passkey 注册流程（已登录用户）
```
1. 用户进入 "账户设置" → "添加 Passkey"
2. POST /api/auth/passkey/register-start
3. 生成 challenge options (userDisplayName, timeout, etc.)
4. 前端调用 navigator.credentials.create(options)
5. 用户完成生物识别（TouchID/FaceID/Windows Hello）
6. POST /api/auth/passkey/register-finish { attestationResponse }
7. 验证 attestation，提取公钥
8. 存储到 passkeys 表 (userId, publicKey, counter)
9. 完成绑定
```

#### Passkey 登录流程
```
1. 用户点击 "Login with Passkey"
2. POST /api/auth/passkey/login-start
3. 生成 challenge options (allowCredentials, timeout, etc.)
4. 前端调用 navigator.credentials.get(options)
5. 用户完成生物识别
6. POST /api/auth/passkey/login-finish { assertionResponse }
7. 验证签名和 counter（防止重放攻击）
8. 创建 session
9. Set-Cookie: session=xxx，重定向到首页
```

**代码位置**: `apps/shell/src/auth/passkey.ts`

---

### 5.5 Session 管理

**方案选择**: Cloudflare Durable Objects（原生支持，单用户单例）

**Session 结构**:
```typescript
interface SessionData {
  id: string;
  userId: number;
  userEmail: string;
  userRole: UserRole;
  expiresAt: string;
  createdAt: string;
}
```

**Cookie 配置**:
```typescript
const sessionCookie = {
  name: 'cf_blog_session',
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 天
  path: '/',
};
```

**代码位置**: `apps/shell/src/auth/session.ts`

---

### 5.6 权限中间件

```typescript
// 路由守卫：检查用户角色
function requireRole(requiredRoles: UserRole[]) {
  return async (request: Request, env: Env) => {
    const session = await getSession(request, env);
    if (!session || !requiredRoles.includes(session.userRole)) {
      return new Response('Forbidden', { status: 403 });
    }
    return { session, env };
  };
}

// 使用示例
// GET /api/posts/create → requireRole(['admin', 'publisher'])
// POST /api/comments → requireRole(['admin', 'publisher', 'commenter'])
```

**代码位置**: `apps/shell/src/auth/middleware.ts`

---

### 5.7 安全防御措施

#### 5.7.1 速率限制 (Rate Limiting)

**使用 Cloudflare Rate Limiting**:

| 端点 | 限制 | 说明 |
|------|------|------|
| `POST /api/auth/github/callback` | 5 次/分钟 | 防止 OAuth 回调滥用 |
| `POST /api/auth/passkey/*` | 10 次/分钟 | 防止 Passkey 暴力破解 |
| `POST /api/comments` | 10 次/小时 | 防止评论 spam |
| `POST /api/users/apply-publisher` | 3 次/天 | 防止申请滥用 |
| `GET /api/admin/*` | 100 次/小时 | 防止管理接口枚举 |

**实现方式**:
```typescript
// apps/shell/src/middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 次/小时
  analytics: true,
  prefix: 'cf_blog',
});

export async function rateLimitMiddleware(request: Request, limit: number, window: string) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
}
```

---

#### 5.7.2 CSRF 防护

**Double Submit Cookie 模式**:

```typescript
// 设置 CSRF Token
const csrfToken = crypto.randomUUID();
response.cookies.set('csrf_token', csrfToken, {
  httpOnly: false,  // 前端需要读取
  secure: true,
  sameSite: 'strict',
  path: '/',
});

// 验证请求头
const requestToken = request.headers.get('X-CSRF-Token');
const cookieToken = getCookie(request, 'csrf_token');
if (requestToken !== cookieToken) {
  return new Response('Forbidden', { status: 403 });
}
```

**适用范围**:
- 所有 `POST/PUT/DELETE` 请求
- 登录/注册/评论/审批操作

---

#### 5.7.3 输入验证与 XSS 防护

**评论/文章内容过滤**:

```typescript
import DOMPurify from 'isomorphic-dompurify';

//  sanitization 配置
const sanitizeConfig = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^(?!(?:(?:java|vb|data):|cid:|blob:))/i,
};

// 过滤用户输入
const sanitizedContent = DOMPurify.sanitize(userInput, sanitizeConfig);

// 链接添加 rel="nofollow" 防止 SEO spam
const withNofollow = sanitizedContent.replace(
  /<a\s+([^>]*?)>/gi,
  '<a $1 rel="nofollow noopener noreferrer" target="_blank">'
);
```

---

#### 5.7.4 枚举攻击防护

**统一错误响应**:

```typescript
// ❌ 错误：泄露用户是否存在
if (!user) {
  return json({ error: 'User not found' });
}

// ✅ 正确：模糊响应
return json({ 
  success: false, 
  message: '如果该用户存在且符合条件，将收到确认邮件' 
});
```

**登录/注册场景**:
- 不泄露邮箱是否已注册
- 不泄露 GitHub 账号是否已绑定
- 统一使用模糊提示

---

#### 5.7.5 敏感操作审计日志

```typescript
// apps/shell/src/audit/log.ts
interface AuditEvent {
  userId: number;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

// 记录关键操作
await auditLog.create({
  userId: session.userId,
  action: 'USER_APPROVED',
  resource: `user:${targetUserId}`,
  timestamp: new Date().toISOString(),
  ipAddress: request.headers.get('CF-Connecting-IP'),
  userAgent: request.headers.get('User-Agent'),
  meta { approverId: session.userId },
});
```

**审计范围**:
- 用户角色变更
- 评论审批/拒绝
- 发布者申请审批
- 管理员操作

---

#### 5.7.6 内容反滥用

**评论频率限制**:
- 新用户（< 7 天）：5 条/天
- 已审批用户：20 条/天
- 发布者：50 条/天

**敏感词过滤** (可选):
```typescript
const blockedPatterns = [
  /\b(viagra|casino|betting)\b/i,  // 示例
  /https?:\/\/\S+/gi,  // 禁止裸链接
];

function isContentAllowed(content: string): boolean {
  return !blockedPatterns.some(pattern => pattern.test(content));
}
```

---

#### 5.7.7 GitHub OAuth 防护

**最小权限 Scope**:
```typescript
// 仅请求必要的权限
const scope = 'user:email';  // 不要请求 repo、admin 等权限

// 验证 state 参数防止 CSRF
const state = crypto.randomUUID();
// 存储到 session，回调时验证
```

**IP 速率限制**:
- 同一 IP 的 OAuth 回调：10 次/小时
- 检测异常的 GitHub 账号（新注册、无头像、无活动）

---

#### 5.7.8 Passkey 安全

```typescript
// 验证 origin 匹配
if (origin !== expectedOrigin) {
  throw new Error('Invalid origin');
}

// 验证 challenge 未过期且未使用
const challengeValid = await validateChallenge(challenge, userId);

// 验证 counter 防止重放
if (newCounter <= storedCounter) {
  throw new Error('Possible replay attack');
}
```

---

#### 5.7.9 Cloudflare Turnstile (人机验证)

**什么是 Turnstile**:
Cloudflare Turnstile 是一个隐私友好的 CAPTCHA 替代方案，无需用户点击"选择所有红绿灯"。

**集成场景**:

| 场景 | 触发条件 | Turnstile 模式 |
|------|---------|---------------|
| **用户注册** (GitHub OAuth 后首次创建) | 所有新用户 | 非侵入式 (non-interactive) |
| **发表评论** | 新用户 (< 7 天 或 isApproved=false) | 非侵入式 |
| **申请发布者** | 所有用户 | 非侵入式 |
| **登录** (Passkey) | 连续失败 3 次后 | 非侵入式 |
| **管理员操作** | 敏感操作 (角色变更、批量审批) | 非侵入式 |

**前端集成**:
```typescript
// apps/next-blog/src/components/Turnstile.tsx
export function Turnstile({ onSuccess }: { onSuccess: (token: string) => void }) {
  useEffect(() => {
    const widgetId = window.turnstile.render('#turnstile-container', {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (token: string) => {
        onSuccess(token);
      },
      theme: 'auto',
    });

    return () => window.turnstile.remove(widgetId);
  }, [onSuccess]);

  return <div id="turnstile-container" />;
}
```

**后端验证**:
```typescript
// apps/shell/src/security/turnstile.ts
export async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });

  const result = await response.json();
  return result.success;
}

// 使用示例
// POST /api/comments
const turnstileToken = request.headers.get('X-Turnstile-Token');
const ip = request.headers.get('CF-Connecting-IP');

if (!await verifyTurnstileToken(turnstileToken, ip)) {
  return json({ error: '人机验证失败' }, { status: 400 });
}
```

**环境配置**:
```bash
# .env
TURNSTILE_SITE_KEY=1x00000000000000000000AA  # 公开，可暴露给前端
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA  # 保密
```

**Cloudflare 配置**:
1. 登录 Cloudflare Dashboard → Turnstile
2. 创建新 Site
3. 选择 **Non-interactive** 模式（推荐）或 **Invisible** 模式
4. 获取 Site Key 和 Secret Key

---

#### 5.7.10 数据库安全

**参数化查询** (Drizzle 默认支持):
```typescript
// ✅ 正确：使用 ORM 参数化
const user = await db.query.users.findFirst({
  where: eq(users.email, email),
});

// ❌ 错误：不要拼接 SQL
// const user = await db.execute(`SELECT * FROM users WHERE email = '${email}'`);
```

**最小权限原则**:
- D1 数据库仅 Workers 可访问
- 不暴露原始 SQL 错误给前端
- 错误日志记录到单独的系统

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/users/apply-publisher` | commenter+ | 申请成为发布者 |
| GET | `/api/users/publisher-applications` | admin | 获取待审批的发布者申请列表 |
| POST | `/api/users/publisher-applications/:id/approve` | admin | 审批通过发布者申请 |
| POST | `/api/users/publisher-applications/:id/reject` | admin | 拒绝发布者申请 |
| GET | `/api/users/:id/comments` | admin/author | 获取用户的评论（用于审批） |
| POST | `/api/comments/:id/approve-user` | admin | 审批评论的用户资质 |
| POST | `/api/comments/:id/approve-post` | publisher | 审批评论的内容（文章作者） |
| POST | `/api/comments/:id/reject` | admin/publisher | 拒绝评论 |

---

## 6. Workers 路由层设计

### 5.1 路由逻辑 (`apps/shell/src/router.ts`)

```typescript
interface RouterEnv {
  // Service Binding - Hono API 后端
  API_BACKEND: Fetcher;
  
  // 环境变量
  SITE_URL: string;
}

export async function handleRouter(request: Request, env: RouterEnv): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // API 路由 → 转发到 Hono 后端
  if (path.startsWith('/api/')) {
    return forwardToApi(request, env);
  }

  // 框架切换器页面
  if (path === '/' || path.startsWith('/_shell/')) {
    return handleShell(request);
  }

  // 静态资源路由（由 Pages 处理，这里做占位）
  if (path.startsWith('/next/')) {
    return serveStatic(path.slice(5), 'next');
  }
  if (path.startsWith('/nuxt/')) {
    return serveStatic(path.slice(5), 'nuxt');
  }
  if (path.startsWith('/svelte/')) {
    return serveStatic(path.slice(7), 'svelte');
  }

  // 默认重定向到 /next/
  if (path === '/') {
    return Response.redirect(new URL('/next/', url));
  }

  // 404
  return new Response('Not Found', { status: 404 });
}

/**
 * 转发请求到 Hono API 后端
 */
async function forwardToApi(request: Request, env: RouterEnv): Promise<Response> {
  // 使用 Service Binding 调用 Hono 后端
  return env.API_BACKEND.fetch(request);
}

async function serveStatic(path: string, framework: string): Promise<Response> {
  // 在 Pages 部署模式下，静态资源由 Pages 自动处理
  // 这里只用于本地开发时的占位
  return new Response(`Static assets for ${framework}: ${path}`, { status: 404 });
}
```

### 6.2 框架切换器 (`apps/router/src/switcher.tsx`)

```tsx
// 使用 Preact（轻量，2KB）或 HTMX
export function FrameworkSwitcher({ currentFramework }: { currentFramework: string }) {
  const frameworks = [
    { id: 'next', name: 'Next.js', color: '#000' },
    { id: 'nuxt', name: 'Nuxt', color: '#00DC82' },
    { id: 'svelte', name: 'SvelteKit', color: '#FF3E00' },
  ];

  return (
    <nav className="framework-switcher">
      {frameworks.map((fw) => (
        <a
          key={fw.id}
          href={`/${fw.id}/`}
          className={`framework-link ${currentFramework === fw.id ? 'active' : ''}`}
          style={{ '--fw-color': fw.color } as any}
        >
          {fw.name}
        </a>
      ))}
    </nav>
  );
}
```

---

## 7. 各框架集成方案

### 6.1 Next.js (`apps/next-blog/`)

```typescript
// next.config.js
export default {
  output: 'export',  // 静态导出
  distDir: '../dist/next',  // 输出到统一目录
  images: { unoptimized: true },  // 静态导出需要
};

// src/lib/db.ts
import { createDb } from '@cf-blog/db';
import { getCloudflareContext } from '@cloudflare/next-on-pages';

export async function getDb() {
  const { env } = await getCloudflareContext();
  return createDb(env.DB);
}
```

### 7.2 Nuxt (`apps/nuxt-blog/`)

**已实现** (`apps/nuxt-blog/`):
- [x] Nuxt 3 项目初始化
- [x] 静态生成配置 (ssr: false, nitro.output)
- [x] 首页博客列表 (`/pages/index.vue`)
- [x] 文章详情页 (`/pages/post/[slug].vue`)
- [x] 框架切换导航

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-01-01',
  devtools: { enabled: false },
  ssr: false,
  nitro: { output: { publicDir: '../dist/nuxt' } },
});
```

### 7.3 SvelteKit (`apps/svelte-blog/`)

**已实现** (`apps/svelte-blog/`):
- [x] SvelteKit 2 项目初始化
- [x] adapter-static 配置
- [x] 首页博客列表 (`/src/routes/+page.svelte`)
- [x] 文章详情页 (`/src/routes/post/[slug]/+page.svelte`)
- [x] 框架切换导航

```typescript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
export default {
  kit: {
    adapter: adapter({ pages: '../dist/svelte', fallback: 'index.html' }),
  },
};
```

### 7.4 Next.js (`apps/next-blog/`)

**已实现** (`apps/next-blog/`):
- [x] Next.js 14 项目初始化
- [x] 静态导出配置 (output: 'export')
- [x] 首页博客列表 (`/src/app/page.tsx`)
- [x] 文章详情页 (`/src/app/post/[slug]/page.tsx`)
- [x] 框架切换导航

```typescript
// next.config.js
export default {
  output: 'export',
  distDir: '../dist/next',
  images: { unoptimized: true },
};
```

### 7.5 Astro (`apps/astro-blog/`)

**已实现** (`apps/astro-blog/`):
- [x] Astro 4 项目初始化
- [x] 静态输出配置 (output: 'static')
- [x] Base 路径配置 (`/astro`)
- [x] 首页博客列表 (`/src/pages/index.astro`)
- [x] 文章详情页 (`/src/pages/post/[slug].astro`)
- [x] 框架切换导航

```typescript
// astro.config.mjs
export default defineConfig({
  outDir: '../dist/astro',
  base: '/astro',
  output: 'static',
});
```

**Astro 特点**:
- 默认零 JavaScript，性能最佳
- Islands Architecture（孤岛架构）
- 内置 Markdown 支持
- 可混用 React/Vue/Svelte 组件

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    output: {
      dir: '../dist/nuxt',
      publicDir: '../dist/nuxt',
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '@cf-blog/db': ['../../packages/db/src'],
        },
      },
    },
  },
});

// server/api/posts.get.ts
export default defineEventHandler(async (event) => {
  const res = await fetch('/api/posts');
  const {  data }  = await res.json();
  return data;
});
```

### 7.3 SvelteKit (`apps/svelte-blog/`)

```typescript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: '../dist/svelte',
      assets: '../dist/svelte',
      fallback: 'index.html',
    }),
  },
};

// src/lib/server/api.ts
export async function fetchPosts() {
  const res = await fetch('/api/posts');
  const {  data }  = await res.json();
  return data;
}
```

---

## 8. 构建与部署流程

### 7.1 pnpm Workspace 配置 (`pnpm-workspace.yaml`)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'

catalog:
  # React ecosystem
  react: ^19.1.0
  react-dom: ^19.1.0

  # Next.js
  next: ^16.2.4

  # Tailwind CSS v4
  tailwindcss: ^4.2.4
  '@tailwindcss/postcss': ^4.2.4

  # TypeScript
  typescript: ^6.0.3
  '@types/node': ^24.0.0

  # Cloudflare
  wrangler: ^4.87.0

  # i18next
  i18next: ^26.0.8
  i18next-browser-languagedetector: ^8.2.1
  i18next-http-backend: ^3.0.6
  react-i18next: ^17.0.6

  # Lucide icons
  lucide-react: ^0.511.0
  '@lucide/vue': ^1.14.0
  '@lucide/svelte': ^0.511.0
  lucide-solid: ^1.2.0
  '@lucide/astro': ^0.5.0

  # Testing
  vitest: ^4.1.5
  '@vitest/coverage-v8': ^4.1.5
  '@playwright/test': ^1.59.1

  # Tiptap editor
  '@tiptap/core': ^3.22.5
  '@tiptap/extension-image': ^3.22.5
  '@tiptap/extension-link': ^3.22.5
  '@tiptap/extension-placeholder': ^3.22.5
  '@tiptap/pm': ^3.22.5
  '@tiptap/react': ^3.22.5
  '@tiptap/starter-kit': ^3.22.5
  '@tiptap/vue-3': ^3.22.5

  # Build tools
  tsx: ^4.7.0
```

### 7.2 构建脚本 (`package.json`)

```json
{
  "scripts": {
    "dev": "pnpm run --parallel dev",
    "build": "pnpm run build:db && pnpm run build:all",
    "build:db": "pnpm -F @cf-blog/db build",
    "build:all": "pnpm -F next-blog build && pnpm -F nuxt-blog build && pnpm -F svelte-blog build",
    "build:shell": "pnpm -F shell build",
    "deploy": "wrangler pages deploy dist/",
    "db:migrate": "pnpm -F @cf-blog/db drizzle-kit generate && wrangler d1 migrations apply",
    "db:seed": "tsx scripts/seed-db.ts"
  }
}
```

### 7.3 Cloudflare Pages 配置 (`.wrangler.toml`)

```toml
name = "cf-blog"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "cf-blog-db"
database_id = "YOUR_D1_DATABASE_ID"
```

### 7.4 GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build all
        run: pnpm build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist/ --project-name=cf-blog
```

---

## 9. 开发阶段规划

### Phase 1: 基础搭建（第 1-2 周）
- [ ] 初始化 pnpm workspace
- [ ] 创建 `packages/db`，定义 schema
- [ ] 创建 D1 数据库，运行迁移
- [ ] 搭建 `apps/shell` 路由层基础

### Phase 2: 单框架验证（第 3 周）
- [ ] 完成 Next.js 应用搭建
- [ ] 集成 Drizzle + D1
- [ ] 实现博客列表/详情页面
- [ ] 验证 Workers 路由

### Phase 3: 多框架扩展（第 4-5 周）
- [ ] 完成 Nuxt 应用搭建
- [ ] 完成 SvelteKit 应用搭建
- [ ] 实现框架切换器 UI
- [ ] 统一样式系统（Tailwind）

### Phase 4: 完善与部署（第 6 周）
- [x] 认证 UI（登录/注册页面，支持 GitHub OAuth、Passkey）
- [x] 管理后台（仪表盘、文章管理、评论审批、用户管理、站点配置）
- [x] 集成编辑器 (TipTap) — 5 框架统一使用 StarterKit + Placeholder + Image + Link
- [x] 五框架认证页面 + 管理后台鉴权守卫
- [x] 五框架 i18n 国际化（中/英双语，共享 @cf-blog/i18n 包）
- [x] 五框架 Admin Layout（侧边栏导航 + 语言切换器 + 用户信息）
- [x] pnpm catalog 统一依赖版本管理
- [x] 配置 CI/CD
- [x] 种子数据与测试
- [ ] 上线部署

---

## 10. 关键技术挑战与解决方案

| 挑战 | 解决方案 |
|------|---------|
| **静态资源路径冲突** | 各框架输出到独立子目录 (`/next/_next/`, `/nuxt/_nuxt/`) |
| **SPA 路由支持** | Workers 拦截 404，返回对应框架的 index.html |
| **共享状态同步** | 使用 localStorage + CustomEvent 同步框架切换状态 |
| **D1 连接复用** | 每个框架通过 Workers 环境注入 DB 实例 |
| **构建产物合并** | 统一输出到 `dist/` 目录，按框架分文件夹 |

---

## 11. 验收标准

### 功能验收
- [ ] 访问 `/` 重定向到 `/next/`
- [ ] 框架切换器可在三个框架间切换
- [ ] 每个框架都能展示博客列表和详情
- [ ] 数据来自同一 D1 数据库

### 技术验收
- [ ] 单测覆盖率 > 60%
- [ ] Lighthouse 分数 > 90
- [ ] 无 TypeScript 类型错误
- [ ] CI/CD 自动部署成功

### 展示验收
- [ ] README 包含项目架构图
- [ ] 每个框架有独立说明文档
- [ ] 部署链接可公开访问

---

## 12. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Cloudflare Pages 构建超时 | 高 | 分框架单独构建，使用缓存 |
| D1 免费额度限制 | 中 | 使用缓存层，限制写操作 |
| 三框架样式冲突 | 中 | CSS Modules + 命名空间隔离 |
| Workers 路由复杂度 | 中 | 先做 MVP，逐步迭代 |

---

## 13. 实时功能设计

### 13.1 在线人数统计

**架构**: Cloudflare Durable Objects + WebSocket

| 统计维度 | 实现方式 | 更新频率 |
|---------|---------|---------|
| **全局在线人数** | Presence DO | 实时（心跳 15 秒） |
| **文章在线人数** | Room DO (per post) | 实时 |
| **页面底部展示** | 前端 Hook + WebSocket | 实时订阅 |

**心跳机制**:
- 客户端每 15 秒发送心跳
- 服务端 30 秒无心跳视为离线
- 定时清理过期连接（每 1 分钟）

**API 设计**:
```typescript
// WebSocket 连接
GET /presence/connect  → WebSocket 升级
GET /room/connect?postId=123  → WebSocket 升级（文章房间）

// 广播事件（内部调用）
POST /room/broadcast
{
  "type": "comment_added" | "comment_approved" | "post_updated" | "content_changed",
  "data": { ... }
}
```

---

### 13.2 实时通知机制

**触发事件**:

| 事件 | 触发条件 | 广播目标 |
|------|---------|---------|
| `comment_added` | 用户发表新评论 | 文章房间所有人 |
| `comment_approved` | 评论通过审批 | 评论作者 + 文章房间 |
| `comment_rejected` | 评论被拒绝 | 评论作者 |
| `post_updated` | 文章内容更新 | 文章房间所有人 |
| `post_published` | 新文章发布 | **首页房间所有人** |

**前端订阅**:
```typescript
// 页面底部组件
function PageFooter({ postId }: { postId: number }) {
  const { onlineCount } = usePresence();  // 全局在线人数
  const { postOnlineCount } = usePostRoom(postId);  // 文章在线人数
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  return (
    <footer>
      <div className="presence">
        <span>🌐 在线人数：{onlineCount}</span>
        <span>📄 本文阅读：{postOnlineCount}</span>
      </div>
      <NotificationPanel notifications={notifications} />
    </footer>
  );
}
```

---

### 13.3 Durable Objects 配置

```typescript
// wrangler.toml
[[durable_objects.bindings]]
name = "PRESENCE_DO"
class_name = "PresenceDO"

[[durable_objects.bindings]]
name = "ROOM_DO"
class_name = "RoomDO"

[[durable_objects.bindings]]
name = "HOME_DO"
class_name = "HomeDO"

[[migrations]]
tag = "v1"
new_classes = ["PresenceDO", "RoomDO", "HomeDO"]
```

---

### 13.4 前端组件

**页面底部栏**:
```
┌─────────────────────────────────────────────────────────┐
│  🌐 128 人在线  |  📄 23 人在读  |  💬 新评论提醒          │
└─────────────────────────────────────────────────────────┘
```

**新评论通知**:
```typescript
// 当收到 comment_added 事件
{
  type: 'comment_added',
   {
    commentId: 456,
    postId: 123,
    authorName: '张三',
    preview: '这篇文章写得很好...',
    timestamp: '2026-05-02T10:30:00Z'
  }
}
```

---

### 13.5 KV 配置管理

**KV 命名空间配置**:

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "CONFIG_KV"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_KV_NAMESPACE_ID"
```

**存储内容**:

| Key 模式 | 值类型 | 说明 | 过期时间 |
|---------|-------|------|---------|
| `config:site` | JSON | 站点配置（标题、描述、SEO） | 无 |
| `config:nav` | JSON | 导航菜单配置 | 无 |
| `config:footer` | JSON | 页脚配置 | 无 |
| `config:announcement` | JSON | 公告配置 | 可选 |
| `cache:post:${slug}:html` | String | 渲染后的 HTML | 1 小时 |
| `cache:home:list` | JSON | 首页文章列表 | 5 分钟 |
| `user:prefs:${userId}` | JSON | 用户偏好设置 | 无 |

**API 设计**:

```typescript
// 获取站点配置
GET /api/config/site

// 更新站点配置（admin only）
POST /api/config/site
{
  title: "我的博客",
  description: "技术分享",
  seo: { keywords: ["前端", "博客"] }
}

// 获取导航配置
GET /api/config/nav

// 更新导航配置（admin only）
POST /api/config/nav
{
  items: [
    { label: "首页", href: "/" },
    { label: "关于", href: "/about" }
  ]
}
```

**前端使用**:

```typescript
// 获取配置（服务端或客户端）
const config = await fetch('/api/config/site').then(r => r.json());

// 更新配置（管理后台）
await fetch('/api/config/site', {
  method: 'POST',
  body: JSON.stringify({ title: '新标题' }),
});
```

---

### 13.6 首页新文章通知

**Home DO（首页房间）**:
- 所有访问首页的用户自动加入首页房间
- 发布者发布新文章时，广播给所有首页用户
- 前端显示新文章提醒横幅 + 通知铃铛

**通知内容**:
```typescript
interface NewPostNotification {
  type: 'post_published';
   {
    postId: number;
    title: string;
    excerpt: string;
    author: string;
    coverImage?: string;
    publishedAt: string;
  };
  timestamp: string;
}
```

**前端交互**:
1. 用户访问首页 → 自动连接 `/home/connect` WebSocket
2. 收到 `post_published` 事件 → 显示提醒横幅
3. 点击"刷新查看" → 重新加载文章列表
4. 通知铃铛显示未读数量

---

### 13.7 访问统计功能

**设计目标**:
- 准确记录真实用户访问次数
- 排除爬虫（Google、Bing 等）污染
- 防止刷新作弊
- 支持趋势分析
- **结合 Cloudflare Analytics 校准数据**

**爬虫识别策略**:

| 检测维度 | 实现方式 | 准确率 |
|---------|---------|-------|
| **User-Agent** | 匹配已知爬虫模式 | 80% |
| **Cloudflare 头部** | CF-Bot-Score 评分 | 90% |
| **IP 段** | 已知爬虫 IP 库 | 85% |
| **行为分析** | 请求频率、Referer 缺失 | 70% |
| **Cloudflare Analytics** | 全球网络训练模型 | 95% |

**去重策略**:
- 同一 Session（LocalStorage ID）30 分钟内只计数一次
- Session ID 持久化存储（用户不清理则长期有效）
- 使用 Beacon API 确保页面关闭时也能上报

**混合统计架构**:
```
自研统计 (实时) + Cloudflare Analytics (校准)
    ↓
每天凌晨同步 Cloudflare 数据
    ↓
对比校验：差异 > 20% → 告警检查
    ↓
更新 post_view_stats 表
```

**数据统计**:
- `post_views` 表：详细访问记录（用于分析）
- `posts.view_count`：累计阅读数（冗余字段，快速查询）
- `posts.unique_view_count`：独立访客数
- `post_view_stats` 表：每日统计（用于趋势图）
- **Cloudflare Analytics**：每天同步校准

**API 设计**:
```typescript
// 记录访问
POST /api/analytics/record
{ postId }

// 获取页面访问数
GET /api/analytics/views/:postId

// 批量获取访问数
GET /api/analytics/views/batch?ids=1,2,3

// 小时级趋势
GET /api/analytics/trend/hourly?hours=24

// 天级趋势
GET /api/analytics/trend/daily?days=7

// 热门页面
GET /api/analytics/top?limit=10

// 来源统计
GET /api/analytics/referer/:postId

// 同步 Cloudflare Analytics (管理员)
POST /api/analytics/sync
{ postIds: string[] }
```

**已实现模块** (`apps/api/src/analytics/`):

| 文件 | 说明 |
|------|------|
| `crawler.ts` | 爬虫识别（User-Agent + CF-Bot-Score 双重检测） |
| `counter.ts` | 访问计数（去重 + 防作弊，1 小时去重窗口） |
| `stats.ts` | 统计分析（小时/天级趋势、来源分析、热门页面） |
| `sync.ts` | Cloudflare Analytics 同步校准 |
| `routes/analytics.ts` | 完整 API 路由 |

**前端展示**:
- 文章页：`👁️ 1,234 次阅读`
- 管理后台：访问趋势图、来源国家、爬虫占比、Cloudflare 数据对比

**Home DO（首页房间）**:
- 所有访问首页的用户自动加入首页房间
- 发布者发布新文章时，广播给所有首页用户
- 前端显示新文章提醒横幅 + 通知铃铛

**通知内容**:
```typescript
interface NewPostNotification {
  type: 'post_published';
   {
    postId: number;
    title: string;
    excerpt: string;
    author: string;
    coverImage?: string;
    publishedAt: string;
  };
  timestamp: string;
}
```

**前端交互**:
1. 用户访问首页 → 自动连接 `/home/connect` WebSocket
2. 收到 `post_published` 事件 → 显示提醒横幅
3. 点击"刷新查看" → 重新加载文章列表
4. 通知铃铛显示未读数量

---

## 14. 内容导入/导出设计

### 14.1 Ghost 导入

**支持格式**: Ghost JSON 导出格式 (`.json`)

**导入流程**:
```
1. 用户上传 Ghost 导出的 JSON 文件
2. 解析 JSON，提取 posts、tags、users
3. 数据转换:
   - HTML → Markdown (使用 turndown 库)
   - Ghost 作者 → 本系统用户/作者
   - Ghost 标签 → 本系统标签
4. 创建文章到 D1
5. 显示导入报告（成功/失败/跳过）
```

**导入配置选项**:
- [ ] 覆盖已有文章（根据 slug 匹配）
- [ ] 导入为草稿（不直接发布）
- [ ] 保留原创建时间
- [ ] 下载并导入图片资源（可选，耗时）

**API 设计**:
```typescript
// POST /api/import/ghost
// Content-Type: multipart/form-data
{
  file: File,  // Ghost 导出的 JSON
  options: {
    overwrite: boolean,
    asDraft: boolean,
    keepOriginalDate: boolean,
    downloadImages: boolean,
  }
}

// 返回
{
  totalPosts: number,
  importedPosts: number,
  skippedPosts: number,
  errors: Array<{ post: string, error: string }>,
}
```

---

### 14.2 内容导出

**支持格式**:

| 格式 | 说明 | 适用场景 |
|------|------|---------|
| **Markdown + Front Matter** | 单文件 `.md` | 迁移到 Hugo/Hexo/Jekyll |
| **Ghost JSON** | 标准 Ghost 格式 | 迁回 Ghost |
| **ZIP 归档** | Markdown + 图片资源 | 完整备份 |

**已实现 API** (`apps/api/src/routes/importexport.ts`):

```typescript
// Ghost 导出
GET /api/importexport/ghost

// Ghost 导入
POST /api/importexport/ghost

// 单篇 Markdown 导出
GET /api/importexport/markdown/:postId

// 批量 Markdown 导出
GET /api/importexport/markdown

// 单篇 ZIP 导出
GET /api/importexport/zip/:postId

// 全站 ZIP 导出
GET /api/importexport/zip
```

**已实现模块** (`apps/api/src/importexport/`):

| 文件 | 说明 |
|------|------|
| `ghost.ts` | Ghost JSON 导入/导出，数据格式转换 |
| `markdown.ts` | Markdown 导出（含 Front Matter），HTML → Markdown 转换 |
| `zip.ts` | ZIP 归档打包 |
| `routes/importexport.ts` | 完整 API 路由 |

**Markdown 格式示例**:
```markdown
---
title: 文章标题
slug: article-slug
excerpt: 摘要内容
status: published
framework: next
created_at: 2024-01-01T00:00:00.000Z
updated_at: 2024-01-01T00:00:00.000Z
published_at: 2024-01-01T00:00:00.000Z
tags:
  - 标签 1
  - 标签 2
author: 作者名
cover_image: https://...
---

这里是 Markdown 正文内容...
```

**API 设计**:
```typescript
// 导出单篇
GET /api/posts/:slug/export?format=md

// 导出全部
GET /api/posts/export?format=zip&all=true

// 导出筛选
GET /api/posts/export?format=zip&status=published&framework=next
```

---

### 14.3 数据可移植性原则

1. **存储格式**: 数据库存储纯 Markdown，不存 HTML
2. **图片资源**: 独立存储（R2/KV），导出时打包
3. **元数据**: 使用 YAML Front Matter，标准格式
4. **导入幂等**: 同一文件多次导入不产生重复数据
5. **导出完整**: 导出内容可用于完整恢复

---

## 16. 编辑器选型设计

### 15.1 选型决策

**最终方案**: **TipTap** (基础富文本编辑器)

**选择理由**:

| 维度 | TipTap 优势 |
|------|------------|
| **编辑体验** | 所见即所得，简洁直观 |
| **Markdown 支持** | 输入 `#` 自动变标题，`**` 变粗体 |
| **可扩展性** | 基于 ProseMirror，支持自定义扩展 |
| **跨框架统一** | 5 个框架使用同一套扩展（StarterKit + Placeholder + Image + Link） |
| **体积** | 轻量，按需加载 |
| **导出格式** | JSON 内容格式，方便存储和渲染 |

### 15.2 编辑器扩展配置

所有 5 个框架使用相同的 TipTap 扩展集（通过 pnpm catalog 统一版本）:

```typescript
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: t('post.contentPlaceholder') }),
    Image.configure({ allowBase64: true }),
    Link.configure({ openOnClick: false }),
  ],
});
```

**pnpm catalog 版本管理** (`pnpm-workspace.yaml`):
```yaml
catalog:
  '@tiptap/core': ^3.22.5
  '@tiptap/extension-image': ^3.22.5
  '@tiptap/extension-link': ^3.22.5
  '@tiptap/extension-placeholder': ^3.22.5
  '@tiptap/pm': ^3.22.5
  '@tiptap/react': ^3.22.5
  '@tiptap/starter-kit': ^3.22.5
  '@tiptap/vue-3': ^3.22.5
```

### 15.3 内容存储

```typescript
// 数据库存储
posts: {
  content: string,  // 纯 Markdown
  contentHtml: string | null,  // 缓存的 HTML（可选，用于 SSR）
}

// 渲染流程
Markdown → (服务端渲染) → HTML
         → (客户端缓存) → 避免重复渲染
```

---

## 16. 架构选型：Workers vs Pages

| 组件 | 平台 | 说明 |
|------|------|------|
| **前端四框架** | Cloudflare Pages | 自动托管静态产物，SPA 回退 |
| **Shell 路由层** | Cloudflare Pages Functions | 路由分发，Service Binding |
| **API 后端** | Cloudflare Workers | Hono API + Durable Objects + KV |

**通信方式**: Service Binding (`api.fetch(request)`)

### 四框架对比

| 框架 | 类型 | 渲染模式 | 适用场景 | 本项目的角色 |
|------|------|---------|---------|-------------|
| **Next.js** | React 框架 | SSG → SSR | 全功能应用 | 展示 React 生态 |
| **Nuxt** | Vue 框架 | SSG → SSR | 内容/应用 | 展示 Vue 生态 |
| **SvelteKit** | Svelte 框架 | SSG → SSR | 轻量应用 | 展示 Svelte 生态 |
| **Astro** | 静态站点生成器 | SSG (默认零 JS) | 内容驱动网站 | 性能标杆，博客首选 |

---

## 17. 后续演进：SSR 支持

### Phase 3: SSR 升级 (可选)

| 框架 | 当前模式 | 目标模式 | 迁移方案 |
|------|---------|---------|---------|
| Next.js | 静态导出 | SSR (Edge) | `@cloudflare/next-on-pages` |
| Nuxt | 静态生成 | SSR (Edge) | `nitro.presets: 'cloudflare-pages'` |
| SvelteKit | 静态适配 | SSR (Edge) | `@sveltejs/adapter-cloudflare` |

**注意事项**:
- RSC (React Server Components) 不可用（Edge 运行时限制）
- SSR 会增加 Cold Start 延迟
- 免费额度消耗增加

---

## 18. 参考资源

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Drizzle ORM D1 Adapter](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Nuxt Static Site Generation](https://nuxt.com/docs/getting-started/deployment#static-hosting)
- [SvelteKit Adapter Static](https://kit.svelte.dev/docs/adapter-static)

---

## 附录 A: 快速启动命令

```bash
# 1. 安装依赖
pnpm install

# 2. 创建 D1 数据库
wrangler d1 create cf-blog-db

# 3. 运行迁移
pnpm db:migrate

# 4. 本地开发
pnpm dev

# 5. 构建部署
pnpm build
pnpm deploy
```

---

*文档版本：1.0 | 最后更新：2026-05-02*
