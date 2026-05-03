/**
 * 文章相关 API 路由
 *
 * - GET /api/posts - 获取文章列表
 * - GET /api/posts/:id - 获取文章详情
 * - GET /api/posts/slug/:slug - 根据 slug 获取文章
 * - POST /api/posts - 创建文章（publisher+）
 * - PUT /api/posts/:id - 更新文章（publisher+）
 * - DELETE /api/posts/:id - 删除文章（admin only）
 */

import * as schema from '@cf-blog/db/schema';
import { authors, posts, postsToTags, tags, users } from '@cf-blog/db/schema';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import type { AuthContext } from '../auth/middleware';
import { adminMiddleware, authMiddleware, publisherMiddleware } from '../auth/middleware';
import type { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// 获取文章列表
app.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const tag = c.req.query('tag');
  const framework = c.req.query('framework');
  const status = c.req.query('status');

  try {
    const db = drizzle(c.env.DB, { schema });

    // 构建查询条件
    const conditions = [];
    if (status) {
      conditions.push(eq(posts.status, status as 'draft' | 'published'));
    }
    if (framework) {
      conditions.push(
        eq(posts.framework, framework as 'next' | 'nuxt' | 'svelte' | 'astro' | 'solid')
      );
    }

    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        status: posts.status,
        framework: posts.framework,
        authorId: posts.authorId,
        viewCount: posts.viewCount,
        uniqueViewCount: posts.uniqueViewCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
        authorName: authors.name,
        authorAvatar: authors.avatar,
      })
      .from(posts)
      .leftJoin(authors, eq(posts.authorId, authors.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(posts.createdAt));

    // 客户端分页
    const offset = (page - 1) * limit;
    const paginatedPosts = allPosts.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: {
        list: paginatedPosts,
        total: allPosts.length,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// 根据 slug 获取文章
app.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug')!;

  try {
    const db = drizzle(c.env.DB, { schema });

    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        content: posts.content,
        coverImage: posts.coverImage,
        status: posts.status,
        framework: posts.framework,
        authorId: posts.authorId,
        viewCount: posts.viewCount,
        uniqueViewCount: posts.uniqueViewCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
        authorName: authors.name,
        authorAvatar: authors.avatar,
        authorBio: authors.bio,
        tags: tags,
      })
      .from(posts)
      .leftJoin(authors, eq(posts.authorId, authors.id))
      .leftJoin(postsToTags, eq(posts.id, postsToTags.postId))
      .leftJoin(tags, eq(postsToTags.tagId, tags.id))
      .where(eq(posts.slug, slug))
      .limit(1);

    if (!result || result.length === 0) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    const post = result[0];

    // 处理标签
    const postTags = result.filter((r) => r.tags?.id).map((r) => r.tags);
    const uniqueTags = Array.from(new Map(postTags.map((t) => [t!.id, t!])).values());

    return c.json({
      success: true,
      data: {
        ...post,
        tags: uniqueTags,
      },
    });
  } catch (error) {
    console.error('Failed to fetch post by slug:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// 获取文章详情（按 ID）
app.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  try {
    const db = drizzle(c.env.DB, { schema });

    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

    if (!result || result.length === 0) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    return c.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// 创建文章（需要发布者权限）
app.post('/', authMiddleware, publisherMiddleware, async (c: AuthContext) => {
  try {
    const session = c.session!;

    const body = await c.req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      framework = 'next',
      status = 'draft',
      tagIds,
    } = body;

    const db = drizzle(c.env.DB, { schema });

    // 获取当前用户的作者信息
    const authorResult = await db
      .select()
      .from(authors)
      .where(eq(authors.userId, session.userId))
      .limit(1);

    // 如果作者记录不存在，创建一个
    let authorId = authorResult[0]?.id;
    if (!authorId) {
      const [newAuthor] = await db
        .insert(authors)
        .values({
          userId: session.userId,
          name: session.userName,
          email: session.userEmail,
          avatar: null,
          bio: null,
          createdAt: new Date().toISOString(),
        })
        .returning();
      authorId = newAuthor.id;
    }

    // 插入文章
    const insertResult = await db
      .insert(posts)
      .values({
        title,
        slug,
        excerpt: excerpt || null,
        content: content || '',
        coverImage: coverImage || null,
        framework,
        status,
        authorId,
        viewCount: 0,
        uniqueViewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: status === 'published' ? new Date().toISOString() : null,
      })
      .returning();

    const newPost = insertResult[0];

    // 关联标签
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await db.insert(postsToTags).values(
        tagIds.map((tagId: number) => ({
          postId: newPost.id,
          tagId,
        }))
      );
    }

    return c.json({
      success: true,
      data: newPost,
    });
  } catch (error) {
    console.error('Failed to create post:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// 更新文章（需要发布者权限）
app.put('/:id', authMiddleware, publisherMiddleware, async (c: AuthContext) => {
  const id = parseInt(c.req.param('id') ?? '0');
  const session = c.session!;

  try {
    const body = await c.req.json();
    const { title, slug, excerpt, content, coverImage, framework, status, tagIds } = body;

    const db = drizzle(c.env.DB, { schema });

    // 检查权限：只有作者或管理员可以编辑
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (!post) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    if (session.userRole !== 'admin' && post.authorId !== session.userId) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }

    // 更新文章
    const updateResult = await db
      .update(posts)
      .set({
        title: title || undefined,
        slug: slug || undefined,
        excerpt: excerpt !== undefined ? excerpt : undefined,
        content: content !== undefined ? content : undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        framework: framework || undefined,
        status: status || undefined,
        updatedAt: new Date().toISOString(),
        publishedAt: status === 'published' ? new Date().toISOString() : null,
      })
      .where(eq(posts.id, id))
      .returning();

    const updatedPost = updateResult[0];

    // 更新标签关联
    if (tagIds !== undefined) {
      // 删除旧的关联
      await db.delete(postsToTags).where(eq(postsToTags.postId, id));

      // 添加新的关联
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        await db.insert(postsToTags).values(
          tagIds.map((tagId: number) => ({
            postId: id,
            tagId,
          }))
        );
      }
    }

    return c.json({
      success: true,
      updatedPost,
    });
  } catch (error) {
    console.error('Failed to update post:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// 删除文章（仅管理员）
app.delete('/:id', authMiddleware, adminMiddleware, async (c: AuthContext) => {
  const id = parseInt(c.req.param('id') ?? '0');
  const session = c.session!;

  try {
    const db = drizzle(c.env.DB, { schema });

    // 检查文章是否存在
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (!post) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    // 先删除标签关联
    await db.delete(postsToTags).where(eq(postsToTags.postId, id));

    // 删除文章
    await db.delete(posts).where(eq(posts.id, id));

    return c.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

export default app;
