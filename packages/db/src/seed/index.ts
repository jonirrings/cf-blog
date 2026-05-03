/**
 * 种子数据脚本
 *
 * 用于初始化和测试的数据
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../schema';

// 模拟用户数据
const users = [
  {
    id: 1,
    githubId: null,
    email: 'admin@example.com',
    name: '管理员',
    avatar: null,
    role: 'admin' as const,
    isApproved: true,
    publisherApplicationStatus: 'none' as const,
    publisherApplicationReason: null,
    publisherApplicationReviewedAt: null,
    publisherApplicationReviewedBy: null,
    publisherApplicationRejectReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
  },
  {
    id: 2,
    githubId: null,
    email: 'publisher@example.com',
    name: '发布者',
    avatar: null,
    role: 'publisher' as const,
    isApproved: true,
    publisherApplicationStatus: 'approved' as const,
    publisherApplicationReason: '申请成为发布者',
    publisherApplicationReviewedAt: new Date().toISOString(),
    publisherApplicationReviewedBy: 1,
    publisherApplicationRejectReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
  },
  {
    id: 3,
    githubId: null,
    email: 'commenter@example.com',
    name: '评论者',
    avatar: null,
    role: 'commenter' as const,
    isApproved: true,
    publisherApplicationStatus: 'none' as const,
    publisherApplicationReason: null,
    publisherApplicationReviewedAt: null,
    publisherApplicationReviewedBy: null,
    publisherApplicationRejectReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
  },
];

// 模拟作者数据
const authors = [
  {
    id: 1,
    userId: 2,
    name: '发布者',
    email: 'publisher@example.com',
    avatar: null,
    bio: '热爱写作，分享技术心得',
    createdAt: new Date().toISOString(),
  },
];

// 模拟标签数据
const tags = [
  { id: 1, name: 'Next.js', slug: 'nextjs' },
  { id: 2, name: 'Nuxt', slug: 'nuxt' },
  { id: 3, name: 'SvelteKit', slug: 'sveltekit' },
  { id: 4, name: 'Astro', slug: 'astro' },
  { id: 5, name: 'Solid', slug: 'solid' },
  { id: 6, name: 'Cloudflare', slug: 'cloudflare' },
  { id: 7, name: '教程', slug: 'tutorial' },
  { id: 8, name: '技术', slug: 'tech' },
];

// 模拟文章数据
const posts = [
  {
    id: 1,
    slug: 'welcome-to-cf-blog',
    title: '欢迎来到 Cloudflare 博客',
    excerpt: '这是一个支持五框架切换的博客系统，基于 Cloudflare Pages + Workers + D1 构建。',
    content: `
      <h2>项目介绍</h2>
      <p>这是一个多框架博客系统，支持以下五个前端框架：</p>
      <ul>
        <li><strong>Next.js 14</strong> - React 框架</li>
        <li><strong>Nuxt 3</strong> - Vue 框架</li>
        <li><strong>SvelteKit 2</strong> - Svelte 框架</li>
        <li><strong>Astro 5</strong> - 静态站点生成器</li>
        <li><strong>SolidStart</strong> - Solid 框架</li>
      </ul>

      <h2>技术架构</h2>
      <p>项目采用以下 Cloudflare 技术栈：</p>
      <ul>
        <li><strong>Cloudflare Pages</strong> - 前端静态资源托管</li>
        <li><strong>Cloudflare Workers</strong> - API 后端和路由层</li>
        <li><strong>Cloudflare D1</strong> - SQLite 数据库</li>
        <li><strong>Cloudflare KV</strong> - 缓存和配置存储</li>
        <li><strong>Cloudflare R2</strong> - 对象存储</li>
        <li><strong>Cloudflare Durable Objects</strong> - 实时 WebSocket 连接</li>
      </ul>

      <h2>核心功能</h2>
      <ul>
        <li>✅ GitHub OAuth + Passkey 认证</li>
        <li>✅ 用户审批和角色管理</li>
        <li>✅ 评论二级审批机制</li>
        <li>✅ 速率限制和 CSRF/XSS 防护</li>
        <li>✅ Turnstile 人机验证</li>
        <li>✅ 审计日志</li>
        <li>✅ 实时在线人数和阅读数</li>
        <li>✅ 内容导入/导出（Ghost、Markdown、ZIP）</li>
        <li>✅ 访问统计（爬虫识别、Cloudflare 同步）</li>
      </ul>

      <h2>开始使用</h2>
      <p>访问不同框架的博客：</p>
      <ul>
        <li>Next.js: <code>/next/</code></li>
        <li>Nuxt: <code>/nuxt/</code></li>
        <li>SvelteKit: <code>/svelte/</code></li>
        <li>Astro: <code>/astro/</code></li>
        <li>Solid: <code>/solid/</code></li>
      </ul>
    `,
    coverImage: null,
    status: 'published' as const,
    framework: 'next' as const,
    authorId: 1,
    viewCount: 100,
    uniqueViewCount: 80,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    slug: 'nextjs-ssg-guide',
    title: 'Next.js 14 静态导出指南',
    excerpt: '学习如何使用 Next.js 14 的静态导出功能，在 Cloudflare Pages 上部署高性能博客。',
    content: `
      <h2>Next.js 14 静态导出</h2>
      <p>Next.js 14 提供了强大的静态导出功能，可以将应用预渲染为纯 HTML 文件。</p>

      <h3>配置步骤</h3>
      <pre><code>
// next.config.js
const nextConfig = {
  output: 'export',
  distDir: '../dist/next',
  images: { unoptimized: true },
  trailingSlash: true,
};
      </code></pre>

      <h3>优势</h3>
      <ul>
        <li>极快的页面加载速度</li>
        <li>无需 Node.js 服务器</li>
        <li>可部署到任何静态托管</li>
        <li>SEO 友好</li>
      </ul>

      <h3>注意事项</h3>
      <p>静态导出不支持以下功能：</p>
      <ul>
        <li>服务端渲染 (SSR)</li>
        <li>增量静态生成 (ISR)</li>
        <li>动态路由需要 generateStaticParams</li>
      </ul>
    `,
    coverImage: null,
    status: 'published' as const,
    framework: 'next' as const,
    authorId: 1,
    viewCount: 50,
    uniqueViewCount: 40,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    slug: 'nuxt-3-ssg',
    title: 'Nuxt 3 SSG 实战',
    excerpt: '使用 Nuxt 3 构建静态博客，体验 Vue 3 + Vite 的开发效率。',
    content: `
      <h2>Nuxt 3 SSG 配置</h2>
      <p>Nuxt 3 提供了灵活的静态生成能力。</p>

      <h3>配置文件</h3>
      <pre><code>
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,
  nitro: {
    output: { publicDir: '../dist/nuxt' }
  }
});
      </code></pre>

      <h3>特性</h3>
      <ul>
        <li>Vue 3 Composition API</li>
        <li>Vite 快速构建</li>
        <li>自动导入组件</li>
        <li>TypeScript 支持</li>
      </ul>
    `,
    coverImage: null,
    status: 'published' as const,
    framework: 'nuxt' as const,
    authorId: 1,
    viewCount: 35,
    uniqueViewCount: 28,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    slug: 'sveltekit-5-runes',
    title: 'SvelteKit 2 + Svelte 5 Runes 详解',
    excerpt: '深入了解 Svelte 5 的 Runes 响应式系统，以及如何在 SvelteKit 2 中使用。',
    content: `
      <h2>Svelte 5 Runes</h2>
      <p>Svelte 5 引入了全新的 Runes 响应式系统。</p>

      <h3>核心 Runes</h3>
      <pre><code>
&lt;script&gt;
  // 响应式状态
  let count = $state(0);

  // 派生状态
  $derived(double = count * 2);

  // 效果
  $effect(() => {
    console.log('count changed:', count);
  });
&lt;/script&gt;
      </code></pre>

      <h3>优势</h3>
      <ul>
        <li>更直观的响应式</li>
        <li>更好的 TypeScript 支持</li>
        <li>更小的打包体积</li>
      </ul>
    `,
    coverImage: null,
    status: 'published' as const,
    framework: 'svelte' as const,
    authorId: 1,
    viewCount: 42,
    uniqueViewCount: 35,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    slug: 'astro-5-islands',
    title: 'Astro 5 Islands Architecture',
    excerpt: '探索 Astro 5 的 Islands 架构，实现零 JavaScript 的超快页面加载。',
    content: `
      <h2>Astro 5 Islands</h2>
      <p>Astro 使用 Islands 架构，默认不发送 JavaScript。</p>

      <h3>配置</h3>
      <pre><code>
// astro.config.mjs
export default defineConfig({
  output: 'static',
  base: '/astro'
});
      </code></pre>

      <h3>特性</h3>
      <ul>
        <li>零 JavaScript 输出</li>
        <li>支持 React/Vue/Svelte 组件</li>
        <li>内容优先</li>
        <li>SEO 友好</li>
      </ul>
    `,
    coverImage: null,
    status: 'published' as const,
    framework: 'astro' as const,
    authorId: 1,
    viewCount: 38,
    uniqueViewCount: 30,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    slug: 'solidstart-fine-grained',
    title: 'SolidStart 细粒度响应式',
    excerpt: 'SolidJS 的细粒度响应式系统，无需 Virtual DOM 的高性能方案。',
    content: `
      <h2>SolidJS 响应式</h2>
      <p>Solid 使用细粒度响应式，没有 Virtual DOM。</p>

      <h3>核心概念</h3>
      <pre><code>
import { createSignal, createEffect } from 'solid-js';

function Counter() {
  const [count, setCount] = createSignal(0);

  createEffect(() => {
    console.log('count:', count());
  });

  return (
    &lt;button onClick={() => setCount(c => c + 1)}&gt;
      {count()}
    &lt;/button&gt;
  );
}
      </code></pre>

      <h3>优势</h3>
      <ul>
        <li>极致性能</li>
        <li>小包体积</li>
        <li>简单直观</li>
      </ul>
    `,
    coverImage: null,
    status: 'published' as const,
    framework: 'solid' as const,
    authorId: 1,
    viewCount: 25,
    uniqueViewCount: 20,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 模拟文章 - 标签关联
const postsToTags = [
  { postId: 1, tagId: 6 },
  { postId: 1, tagId: 8 },
  { postId: 2, tagId: 1 },
  { postId: 2, tagId: 7 },
  { postId: 3, tagId: 2 },
  { postId: 3, tagId: 7 },
  { postId: 4, tagId: 3 },
  { postId: 4, tagId: 8 },
  { postId: 5, tagId: 4 },
  { postId: 5, tagId: 7 },
  { postId: 6, tagId: 5 },
  { postId: 6, tagId: 8 },
];

// 模拟评论数据
const comments = [
  {
    id: 1,
    postId: 1,
    userId: 3,
    content: '很棒的项目！学到了很多。',
    userApproved: true,
    postApproved: true,
    rejected: false,
    userApprovedAt: new Date().toISOString(),
    userApprovedBy: 1,
    postApprovedAt: new Date().toISOString(),
    postApprovedBy: 2,
    rejectedAt: null,
    rejectedBy: null,
    rejectReason: null,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    postId: 1,
    userId: 3,
    content: '请问支持 SSR 吗？',
    userApproved: true,
    postApproved: true,
    rejected: false,
    userApprovedAt: new Date().toISOString(),
    userApprovedBy: 1,
    postApprovedAt: new Date().toISOString(),
    postApprovedBy: 2,
    rejectedAt: null,
    rejectedBy: null,
    rejectReason: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    postId: 2,
    userId: 3,
    content: 'Next.js 14 的静态导出很实用！',
    userApproved: true,
    postApproved: false,
    rejected: false,
    userApprovedAt: new Date().toISOString(),
    userApprovedBy: 1,
    postApprovedAt: null,
    postApprovedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectReason: null,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    postId: 3,
    userId: 3,
    content: 'Nuxt 3 的 DX 真的很好。',
    userApproved: false,
    postApproved: false,
    rejected: false,
    userApprovedAt: null,
    userApprovedBy: null,
    postApprovedAt: null,
    postApprovedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectReason: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * 执行种子数据插入
 */
export async function seed(db: ReturnType<typeof drizzle>) {
  console.log('🌱 开始插入种子数据...');

  // 插入用户
  console.log('📝 插入用户数据...');
  for (const user of users) {
    await db.insert(schema.users).values(user).onConflictDoNothing();
  }

  // 插入作者
  console.log('📝 插入作者数据...');
  for (const author of authors) {
    await db.insert(schema.authors).values(author).onConflictDoNothing();
  }

  // 插入标签
  console.log('📝 插入标签数据...');
  for (const tag of tags) {
    await db.insert(schema.tags).values(tag).onConflictDoNothing();
  }

  // 插入文章
  console.log('📝 插入文章数据...');
  for (const post of posts) {
    await db.insert(schema.posts).values(post).onConflictDoNothing();
  }

  // 插入文章 - 标签关联
  console.log('📝 插入文章 - 标签关联...');
  for (const pt of postsToTags) {
    await db.insert(schema.postsToTags).values(pt).onConflictDoNothing();
  }

  // 插入评论
  console.log('📝 插入评论数据...');
  for (const comment of comments) {
    await db.insert(schema.comments).values(comment).onConflictDoNothing();
  }

  console.log('✅ 种子数据插入完成！');
}

/**
 * 清除所有数据
 */
export async function clear(db: ReturnType<typeof drizzle>) {
  console.log('🗑️ 清除所有数据...');

  await db.delete(schema.comments).run();
  await db.delete(schema.postsToTags).run();
  await db.delete(schema.posts).run();
  await db.delete(schema.tags).run();
  await db.delete(schema.authors).run();
  await db.delete(schema.users).run();

  console.log('✅ 数据清除完成！');
}

export { users, authors, tags, posts, postsToTags, comments };
