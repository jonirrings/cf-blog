# Lucide 图标使用指南

本项目使用 [Lucide Icons](https://lucide.dev) 作为统一的图标库。

## 已安装的包

| 框架 | 包名 | 引入方式 |
|------|------|---------|
| Next.js (React) | `lucide-react` | `import { Home } from 'lucide-react'` |
| Nuxt (Vue) | `@lucide/vue` | `import { Home } from '@lucide/vue'` |
| SvelteKit | `@lucide/svelte` | `import { Home } from '@lucide/svelte'` |
| SolidStart | `lucide-solid` | `import { Home } from 'lucide-solid'` |
| Astro | `@lucide/astro` | `import { Home } from '@lucide/astro'` |

## 使用示例

### Next.js (React)

```tsx
'use client';

import { Home, User, Settings, Menu } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="flex items-center gap-4">
      <a href="/" className="flex items-center gap-2">
        <Home size={20} className="text-gray-600" />
        <span>首页</span>
      </a>
      <button className="p-2 hover:bg-gray-100 rounded">
        <Menu size={20} />
      </button>
    </nav>
  );
}
```

### Nuxt (Vue)

```vue
<script setup lang="ts">
import { Home, User, Settings, Menu } from 'lucide-vue-next';
</script>

<template>
  <nav class="flex items-center gap-4">
    <a href="/" class="flex items-center gap-2">
      <Home :size="20" class="text-gray-600" />
      <span>首页</span>
    </a>
    <button class="p-2 hover:bg-gray-100 rounded">
      <Menu :size="20" />
    </button>
  </nav>
</template>
```

### SvelteKit

```svelte
<script lang="ts">
  import { Home, User, Settings, Menu } from '@lucide/svelte';
</script>

<nav class="flex items-center gap-4">
  <a href="/" class="flex items-center gap-2">
    <Home size={20} class="text-gray-600" />
    <span>首页</span>
  </a>
  <button class="p-2 hover:bg-gray-100 rounded">
    <Menu size={20} />
  </button>
</nav>
```

### SolidStart

```tsx
import { Component } from 'solid-js';
import { Home, User, Settings, Menu } from 'lucide-solid';

export const Navigation: Component = () => {
  return (
    <nav class="flex items-center gap-4">
      <a href="/" class="flex items-center gap-2">
        <Home size={20} class="text-gray-600" />
        <span>首页</span>
      </a>
      <button class="p-2 hover:bg-gray-100 rounded">
        <Menu size={20} />
      </button>
    </nav>
  );
};
```

### Astro

```astro
---
import { Home, Menu } from '@lucide/astro';
---

<nav class="flex items-center gap-4">
  <a href="/" class="flex items-center gap-2">
    <Home size={20} class="text-gray-600" />
    <span>首页</span>
  </a>
  <button class="p-2 hover:bg-gray-100 rounded">
    <Menu size={20} />
  </button>
</nav>
```

## 常用图标

```typescript
// 导航
import { Home, Menu, X, ChevronRight, ChevronDown, ArrowLeft } from '...'

// 操作
import { Edit, Trash2, Plus, Save, Cancel, Check, X } from '...'

// 状态
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from '...'

// 用户
import { User, Users, UserPlus, LogOut, Settings } from '...'

// 内容
import { FileText, Image, Link, Tag, Calendar, Eye } from '...'

// 社交
import { Github, Mail, ExternalLink } from '...'
```

## Props

所有 Lucide 图标组件支持以下 props：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `number` | `24` | 图标尺寸（像素） |
| `color` | `string` | `currentColor` | 图标颜色 |
| `strokeWidth` | `number` | `2` | 描边宽度 |
| `class` / `className` | `string` | - | CSS 类名 |

## 查找图标

访问 [Lucide 图标目录](https://lucide.dev/icons) 查看所有可用图标。

## Tree Shaking

所有包都支持 Tree Shaking，只会打包实际使用的图标。
