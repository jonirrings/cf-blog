# @cf-blog/i18n - 多框架国际化方案

基于 **i18next** 为 Cloudflare 多框架博客系统（Next.js, Nuxt, SvelteKit, Astro, SolidStart）提供统一的国际化支持。

## 为什么使用 i18next？

- ✅ **成熟稳定**：业界标准的国际化库，社区活跃
- ✅ **框架支持**：5 个前端框架都有官方/社区插件
- ✅ **功能丰富**：命名空间、懒加载、复数、上下文等
- ✅ **集中管理**：所有翻译统一在 `packages/i18n/src/translations.ts` 维护
- ✅ **TypeScript 类型安全**：翻译键类型检查，防止拼写错误

## 支持的语言

| 语言 | Code | Flag |
|------|------|------|
| 简体中文 | zh-CN | 🇨🇳 |
| English | en | 🇺🇸 |

## 安装

已在 monorepo 中配置，核心依赖：

```json
{
  "dependencies": {
    "i18next": "^26.0.8",
    "react-i18next": "^17.0.6"
  }
}
```

## 使用方法

### 1. Next.js 14 (App Router)

```tsx
// src/components/Header.tsx
'use client';

import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header() {
  const { t, locale, changeLocale } = useTranslation();

  return (
    <header>
      <nav>
        <a href="/">{t('nav.home')}</a>
        <a href="/admin">{t('nav.admin')}</a>
      </nav>
      <LanguageSwitcher />
    </header>
  );
}
```

### 2. Nuxt 3

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
const { t, locale, setLocale } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t('post.list') }}</h1>
    <select :value="locale" @change="setLocale($event.target.value)">
      <option value="zh-CN">🇨🇳 简体中文</option>
      <option value="en">🇺🇸 English</option>
    </select>
  </div>
</template>
```

### 3. SvelteKit

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { t, locale, setLocaleWithCookie } from '$lib/i18n';
</script>

<div>
  <h1>{t('post.list')}</h1>
  <select on:change={(e) => setLocaleWithCookie(e.target.value)}>
    <option value="zh-CN">🇨🇳 简体中文</option>
    <option value="en">🇺🇸 English</option>
  </select>
</div>
```

### 4. Astro

```astro
---
// src/pages/index.astro
import { getLocaleFromRequest, getT } from '../lib/i18n';

const locale = getLocaleFromRequest(Astro.request);
const t = getT(locale);
---

<html lang={locale}>
  <body>
    <h1>{t('post.list')}</h1>
  </body>
</html>
```

### 5. SolidStart

```tsx
// src/routes/index.tsx
import { useTranslation } from '~/lib/i18n';

export default function HomePage() {
  const { t, locale, changeLocale } = useTranslation();

  return (
    <main>
      <h1>{t('post.list')}</h1>
      <select
        value={locale()}
        onChange={(e) => changeLocale(e.target.value as any)}
      >
        <option value="zh-CN">🇨🇳 简体中文</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </main>
  );
}
```

## 翻译键管理

### 添加新翻译键

1. **在 `packages/i18n/src/translations.ts` 中添加键名**：

```typescript
export type TranslationKey =
  | 'nav.home'
  | 'nav.admin'
  | 'my.new.key' // 新增
```

2. **添加中文翻译**：

```typescript
export const zhCN: Translations = {
  'nav.home': '首页',
  'my.new.key': '我的新文案', // 新增
};
```

3. **添加英文翻译**：

```typescript
export const en: Translations = {
  'nav.home': 'Home',
  'my.new.key': 'My new copy', // 新增
};
```

### 使用动态参数

```typescript
// translations.ts
'post.viewCount': '浏览量：{count}',

// 组件中
const { t } = useTranslation();
<p>{t('post.viewCount', { count: 1234 })}</p>
```

## API 参考

### 核心方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `i18n.t(key, params)` | 获取翻译 | `t('nav.home')` |
| `i18n.changeLanguage(lng)` | 切换语言 | `changeLanguage('en')` |
| `i18n.language` | 当前语言 | `locale.value` |

### 框架 Hooks

#### Next.js

```typescript
const { t, i18n, locale, changeLocale, ready } = useTranslation();
```

#### Nuxt

```typescript
const { t, locale, setLocale, supportedLocales, ready, i18n } = useI18n();
```

#### SvelteKit

```typescript
const $locale = get(locale);
const $ready = get(ready);
t('key');
setLocaleWithCookie('en');
```

#### SolidStart

```typescript
const { t, i18n, locale, changeLocale, ready } = useTranslation();
```

## 最佳实践

### ✅ 推荐

```tsx
// 单一 Key 语义完整
const title = t('post.management.title');

// 使用动态参数
const count = t('cart.item.count', { count: 5 });

// 类型安全
const navHome = t('nav.home'); // TypeScript 会检查键是否存在
```

### ❌ 禁止

```tsx
// 多 Key 拼接
const msg = t('you.have') + count + t('items'); // ❌

// 直接写死文案
<h1>文章列表</h1> // ❌ 应该用 t('post.list')

// 使用未定义的 Key
t('undefined.key'); // ❌ TypeScript 会报错
```

## 文件结构

```
packages/i18n/
├── src/
│   ├── translations.ts    # 核心翻译数据（所有语言）
│   ├── i18n.ts            # i18next 初始化配置
│   └── index.ts           # 出口文件
├── package.json
└── README.md              # 本文档
```

各框架集成文件：

```
apps/next-blog/src/lib/i18n.ts       # Next.js 集成 + useTranslation Hook
apps/next-blog/src/components/LanguageSwitcher.tsx
apps/nuxt-blog/composables/useI18n.ts # Nuxt 集成 + useI18n Composable
apps/svelte-blog/src/lib/i18n.ts      # SvelteKit 集成 + store
apps/astro-blog/src/lib/i18n.ts       # Astro 集成（服务端）
apps/solid-blog/src/lib/i18n.ts       # SolidStart 集成 + useTranslation
```

## 常用翻译键

### 导航
- `nav.home` - 首页 / Home
- `nav.admin` - 管理后台 / Admin
- `nav.login` - 登录 / Login
- `nav.logout` - 退出 / Logout

### 管理后台
- `admin.dashboard` - 仪表盘 / Dashboard
- `admin.posts` - 文章管理 / Posts
- `admin.comments` - 评论审批 / Comments
- `admin.users` - 用户管理 / Users
- `admin.settings` - 站点配置 / Settings

### 文章
- `post.title` - 标题 / Title
- `post.list` - 文章列表 / Post List
- `post.management` - 文章管理 / Post Management
- `post.new` - 新建文章 / New Post
- `post.edit` - 编辑文章 / Edit Post
- `post.delete` - 删除文章 / Delete Post

### 通用
- `common.loading` - 加载中... / Loading...
- `common.success` - 操作成功 / Success
- `common.cancel` - 取消 / Cancel
- `common.confirm` - 确认 / Confirm

## 许可证

MIT
