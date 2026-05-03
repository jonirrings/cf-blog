/**
 * 评论相关 API 路由
 *
 * - GET /api/comments - 获取评论列表（根据权限过滤）
 * - POST /api/comments - 创建评论
 * - PUT /api/comments/:id - 更新评论
 * - DELETE /api/comments/:id - 删除评论
 * - POST /api/comments/:id/approve - 审批通过（作者/管理员）
 * - POST /api/comments/:id/reject - 审批拒绝（作者/管理员）
 * - GET /api/comments/pending - 获取待审批评论列表
 */

import { Hono } from 'hono';
import type { Env } from '../index';
import { authMiddleware, adminMiddleware, requireAuth } from '../auth/middleware';
import { getSession } from '../auth/session';
import {
  getPendingComments,
  userApproveComment,
  authorApproveComment,
  adminApproveComment,
  rejectComment,
} from '../approval/comment';
import { validateCommentInput } from '../security/sanitize';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/comments - 获取评论列表
 */
app.get('/', async (c) => {
  const postId = c.req.query('postId');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');

  try {
    const { drizzle } = await import('drizzle-orm/d1');
    const { comments, users, posts } = await import('@cf-blog/db/schema');
    const { eq, and, desc } = await import('drizzle-orm');

    const db = drizzle(c.env.DB);

    // 构建查询条件
    const conditions: any[] = [];
    if (postId) {
      conditions.push(eq(comments.postId, parseInt(postId)));
    }
    // 只查询已审批通过的评论（对公众可见）
    conditions.push(eq(comments.userApproved, true));
    conditions.push(eq(comments.postApproved, true));
    conditions.push(eq(comments.rejected, false));

    const query = db
      .select({
        id: comments.id,
        content: comments.content,
        postId: comments.postId,
        userId: comments.userId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        userName: users.name,
        userAvatar: users.avatar,
        postTitle: posts.title,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(posts, eq(comments.postId, posts.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(comments.createdAt));

    const allComments = await query;

    // 客户端分页
    const offset = (page - 1) * limit;
    const paginatedComments = allComments.slice(offset, offset + limit);

    return c.json({
      success: true,
      data: {
        list: paginatedComments,
        total: allComments.length,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

/**
 * GET /api/comments/pending - 获取待审批评论列表
 */
app.get('/pending', authMiddleware, async (c: any) => {
  const session = c.session;
  const postId = c.req.query('postId') ? parseInt(c.req.query('postId')) : undefined;

  const comments = await getPendingComments(c.env.DB, postId, session.userId);

  return c.json({
    success: true,
    comments,
  });
});

/**
 * POST /api/comments - 创建评论
 */
app.post('/', requireAuth(), async (c: any) => {
  const session = c.session;

  try {
    const body = await c.req.json();
    const { postId, content } = body;

    if (!postId || !content) {
      return c.json({ error: '缺少必要参数' }, 400);
    }

    const { drizzle } = await import('drizzle-orm/d1');
    const { comments } = await import('@cf-blog/db/schema');
    const { eq } = await import('drizzle-orm');

    const db = drizzle(c.env.DB);

    // 检查文章是否存在
    const { posts } = await import('@cf-blog/db/schema');
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, parseInt(postId)),
    });

    if (!post) {
      return c.json({ error: '文章不存在' }, 404);
    }

    // 验证输入
    const validatedContent = validateCommentInput(content);

    // 创建评论
    const result = await db
      .insert(comments)
      .values({
        postId: parseInt(postId),
        userId: session.userId,
        content: validatedContent,
        userApproved: false,
        postApproved: false,
        rejected: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return c.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

/**
 * POST /api/comments/:id/approve - 审批评论
 */
app.post('/:id/approve', authMiddleware, async (c: any) => {
  const session = c.session;
  const commentId = parseInt(c.req.param('id'));
  const isAdmin = session.userRole === 'admin';

  // 检查是否是文章作者
  const { drizzle } = await import('drizzle-orm/d1');
  const { comments, posts } = await import('@cf-blog/db/schema');
  const { eq } = await import('drizzle-orm');

  const db = drizzle(c.env.DB);
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    with: { post: { columns: { authorId: true } } },
  });

  if (!comment) {
    return c.json({ error: '评论不存在' }, 404);
  }

  const isAuthor = comment.post.authorId === session.userId;

  let result;
  if (isAdmin) {
    result = await adminApproveComment(c.env.DB, commentId, session.userId);
  } else if (isAuthor) {
    result = await authorApproveComment(c.env.DB, commentId, session.userId);
  } else {
    result = await userApproveComment(c.env.DB, commentId, session.userId);
  }

  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }

  return c.json({ success: true });
});

/**
 * POST /api/comments/:id/reject - 拒绝评论
 */
app.post('/:id/reject', authMiddleware, async (c: any) => {
  const session = c.session;
  const commentId = parseInt(c.req.param('id'));
  const isAdmin = session.userRole === 'admin';

  const body = await c.req.json().catch(() => ({}));
  const reason = body.reason;

  const { drizzle } = await import('drizzle-orm/d1');
  const { comments, posts } = await import('@cf-blog/db/schema');
  const { eq } = await import('drizzle-orm');

  const db = drizzle(c.env.DB);
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    with: { post: { columns: { authorId: true } } },
  });

  if (!comment) {
    return c.json({ error: '评论不存在' }, 404);
  }

  const isAuthor = comment.post.authorId === session.userId;

  // 只有管理员或文章作者可以拒绝
  if (!isAdmin && !isAuthor) {
    return c.json({ error: '无权拒绝此评论' }, 403);
  }

  const result = await rejectComment(c.env.DB, commentId, session.userId, isAdmin, reason);

  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }

  return c.json({ success: true });
});

/**
 * DELETE /api/comments/:id - 删除评论
 */
app.delete('/:id', authMiddleware, async (c: any) => {
  const session = c.session;
  const commentId = parseInt(c.req.param('id'));

  const { drizzle } = await import('drizzle-orm/d1');
  const { comments } = await import('@cf-blog/db/schema');
  const { eq } = await import('drizzle-orm');

  const db = drizzle(c.env.DB);
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });

  if (!comment) {
    return c.json({ error: '评论不存在' }, 404);
  }

  // 只有评论作者或管理员可以删除
  if (comment.userId !== session.userId && session.userRole !== 'admin') {
    return c.json({ error: '无权删除此评论' }, 403);
  }

  await db.delete(comments).where(eq(comments.id, commentId));

  return c.json({ success: true });
});

export default app;
