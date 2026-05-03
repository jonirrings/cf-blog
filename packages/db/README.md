# @cf-blog/db

共享数据库包，包含 Drizzle ORM schema 和 D1 连接客户端。

## 使用方式

```typescript
// 导入 schema
import { posts, users, comments } from '@cf-blog/db/schema';

// 导入数据库客户端
import { getDb } from '@cf-blog/db/client';

// 在 Cloudflare Workers 中使用
export default {
  async fetch(request: Request, env: Env) {
    const db = getDb(env);
    
    // 查询文章
    const allPosts = await db.query.posts.findMany();
    
    // 创建文章
    await db.insert(posts).values({
      slug: 'my-post',
      title: 'Hello World',
      content: '...',
      framework: 'next',
    });
  },
};
```

## 数据库表

### 认证相关
- `users` - 用户表
- `passkeys` - Passkey 凭证
- `sessions` - 会话

### 博客内容
- `authors` - 作者
- `posts` - 文章
- `tags` - 标签
- `postsToTags` - 文章 - 标签关联
- `comments` - 评论

### 访问统计
- `postViews` - 访问记录
- `postViewStats` - 每日统计

### 审计日志
- `auditLogs` - 操作日志

## 迁移

```bash
# 生成迁移
pnpm -F @cf-blog/db db:generate

# 应用到本地
pnpm -F @cf-blog/db db:migrate:local

# 应用到生产
pnpm -F @cf-blog/db db:migrate
```
