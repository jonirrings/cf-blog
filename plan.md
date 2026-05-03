# Cloudflare 多框架博客项目实施计划

> **项目**: cf-blog  
> **目标**: 在 Cloudflare Pages 上搭建支持 Next.js/Nuxt/SvelteKit/Astro/Solid 五框架切换的博客，集成自研认证系统、评论审批机制、安全防御体系、实时功能和内容导入/导出  
> **预计周期**: 12 周 | **当前阶段**: Phase 2 完成 | **最后更新**: 2026-05-03
>
> **架构变更**: 采用独立 Hono API 后端 (`apps/api`)，通过 Service Binding 与 Shell 路由层通信

---

## 实施路线图

### Phase 1: 基础架构搭建（Week 1-2）✅ 100% 完成

#### 已完成任务
1. [x] 初始化 pnpm workspace
2. [x] 创建 `packages/db`（完整 schema）
3. [x] 创建 D1 数据库
4. [x] 搭建 `apps/shell` 基础路由
5. [x] 创建 Hono API 后端 (`apps/api`)

#### P0: 核心功能 ✅ 100% 完成
- 认证模块 (OOBE, GitHub OAuth, Passkey, Session, Middleware)
- 审批模块 (用户审批、评论二级审批、发布者申请)
- 安全防御模块 (速率限制、CSRF、XSS、Turnstile、审计日志)

#### P1: 增强功能 ✅ 100% 完成
- 实时广播服务 (`broadcast.ts`)
- 导入/导出模块 (Ghost、Markdown、ZIP)
- 访问统计模块 (爬虫识别、计数、趋势、Cloudflare 同步)
- KV 配置管理 (站点配置、导航配置、用户偏好)

---

### Phase 2: 前端集成（Week 3-4）✅ 100% 完成

#### P2: 前端框架

| # | 框架 | 状态 | 版本 | 模式 | 目录 |
|---|------|------|------|------|------|
| 9 | Next.js | ✅ 完成 | 16.2 | SSG | `apps/next-blog/` |
| 10 | Nuxt | ✅ 完成 | 3.21 | SSG | `apps/nuxt-blog/` |
| 11 | SvelteKit | ✅ 完成 | 2.20 + Svelte 5.20 | SSG | `apps/svelte-blog/` |
| 12 | Astro | ✅ 完成 | 5.3 | SSG | `apps/svelte-blog/` |
| 13 | SolidStart | ✅ 完成 | 1.2 + Solid 1.9 | SSG | `apps/solid-blog/` |
| 14 | 框架切换器 | ✅ 完成 | - | 各页面内集成 | - |

**方案 A 模式 1**: 纯静态并列展示
- 每个框架独立构建到 `dist/<framework>/`
- Shell 路由分发：`/<framework>/*` → 对应产物
- 无 SSR（后续演进方向）

#### 已完成功能

- [x] 五框架公共页面（首页、文章详情）+ i18n 迁移
- [x] 五框架管理后台（Dashboard、文章 CRUD、评论审批、用户管理、站点配置）
- [x] 五框架认证页面（登录、注册、待审批）+ 管理后台鉴权守卫
- [x] 五框架 Admin Layout（侧边栏导航 + 语言切换器 + 用户信息）
- [x] TipTap 富文本编辑器（5 框架统一，StarterKit + Placeholder + Image + Link）
- [x] 共享 i18n 包 (`@cf-blog/i18n`)：i18next，zh-CN + en 双语，~220 个翻译键
- [x] 共享 Auth UI 包 (`@cf-blog/auth-ui`)：React 组件（LoginForm、RegisterForm、GitHubButton、PasskeyButton）
- [x] pnpm catalog 统一依赖版本管理（React、TypeScript、TipTap、i18next 等）

#### 各框架 i18n 集成方式

| 框架 | 集成方式 | 文件 |
|------|---------|------|
| Next.js | `useTranslation()` hook (React) | `@cf-blog/i18n/react` |
| Nuxt | `useI18n()` composable | `composables/useI18n.ts` |
| SvelteKit | `$t()` Svelte store | `src/lib/i18n.ts` |
| SolidStart | `useTranslation()` hook (Solid signals) | `src/lib/i18n.ts` |
| Astro | 服务端 `i18n.t()` + `define:vars` 水合 | 页面 `.astro` 文件 |

---

## 后续演进方向

### Phase 3: SSR 升级 (可选)

| 框架 | 当前模式 | 目标模式 | 迁移工作量 |
|------|---------|---------|-----------|
| Next.js | SSG | SSR (Edge) | 中 (@cloudflare/next-on-pages) |
| Nuxt | SSG | SSR (Edge) | 低 (nitro preset) |
| SvelteKit | SSG | SSR (Edge) | 低 (adapter-cloudflare) |
| Astro | SSG | SSR/Hybrid | 低 (output: 'server') |
| SolidStart | SSG | SSR (Edge) | 中 (nitro preset) |

### Phase 4: 完善与部署

- [x] CI/CD 配置
- [x] 种子数据与测试
- [x] 文章管理 CRUD 完整实现
- [x] 认证系统（邮箱密码 + GitHub OAuth + Passkey）
- [x] 五框架 i18n 国际化（中/英双语）
- [x] 五框架认证页面 + 管理后台鉴权
- [x] TipTap 编辑器（5 框架统一）
- [ ] E2E 测试覆盖
- [ ] 上线部署

---

*创建日期：2026-05-02 | 最后更新：2026-05-03 | 状态：✅ 五框架功能对齐完成，i18n 全量迁移完成*
