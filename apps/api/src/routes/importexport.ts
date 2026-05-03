/**
 * 导入/导出 API 路由
 *
 * - GET /api/importexport/ghost - 导出 Ghost JSON 格式
 * - POST /api/importexport/ghost - 导入 Ghost JSON 格式
 * - GET /api/importexport/markdown/:postId - 导出单篇文章为 Markdown
 * - GET /api/importexport/markdown - 导出所有文章为 Markdown（ZIP）
 * - GET /api/importexport/zip/:postId - 导出单篇文章为 ZIP
 * - GET /api/importexport/zip - 导出整个博客为 ZIP
 */

import { Hono } from 'hono';
import type { Env } from '../index';
import { adminMiddleware } from '../auth/middleware';
import { importFromGhost, exportToGhost } from '../importexport/ghost';
import { exportPostAsMarkdown, exportAllPostsAsMarkdown } from '../importexport/markdown';
import { exportPostAsZip, exportBlogAsZip } from '../importexport/zip';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/importexport/ghost - 导出 Ghost JSON 格式
 */
app.get('/ghost', adminMiddleware, async (c) => {
  try {
    const ghostData = await exportToGhost(c.env);
    return c.json({
      success: true,
      ghostData,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: (error as Error).message,
      },
      500
    );
  }
});

/**
 * POST /api/importexport/ghost - 导入 Ghost JSON 格式
 */
app.post('/ghost', adminMiddleware, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    if (!body.data || !body.data.posts) {
      return c.json(
        {
          success: false,
          error: 'Invalid Ghost export format',
        },
        400
      );
    }

    const result = await importFromGhost(c.env, body);

    return c.json({
      success: result.success,
      importedPosts: result.importedPosts,
      importedTags: result.importedTags,
      errors: result.errors,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: (error as Error).message,
      },
      500
    );
  }
});

/**
 * GET /api/importexport/markdown/:postId - 导出单篇文章为 Markdown
 */
app.get('/markdown/:postId', adminMiddleware, async (c) => {
  const postId = c.req.param('postId');

  try {
    const result = await exportPostAsMarkdown(c.env, postId!);

    if (!result) {
      return c.json(
        {
          success: false,
          error: 'Post not found',
        },
        404
      );
    }

    return c.body(result.content, 200, {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: (error as Error).message,
      },
      500
    );
  }
});

/**
 * GET /api/importexport/markdown - 导出所有文章为 Markdown（ZIP）
 */
app.get('/markdown', adminMiddleware, async (c) => {
  try {
    const posts = await exportAllPostsAsMarkdown(c.env);

    // 创建简单的 ZIP（实际应使用 jszip）
    const encoder = new TextEncoder();
    const zipData = new Uint8Array(
      posts.reduce((acc, post) => acc + encoder.encode(post.content).length + 100, 1000)
    );

    // 简化实现：返回第一个文章的 Markdown
    // 实际应生成包含所有文章的 ZIP
    if (posts.length > 0) {
      return c.body(posts[0].content, 200, {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="export.md"',
      });
    }

    return c.body('', 200, {
      'Content-Type': 'text/markdown',
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: (error as Error).message,
      },
      500
    );
  }
});

/**
 * GET /api/importexport/zip/:postId - 导出单篇文章为 ZIP
 */
app.get('/zip/:postId', adminMiddleware, async (c) => {
  const postId = c.req.param('postId');

  try {
    const result = await exportPostAsZip(c.env, postId!);

    if (!result) {
      return c.json(
        {
          success: false,
          error: 'Post not found',
        },
        404
      );
    }

    return c.body(result.data as any, 200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: (error as Error).message,
      },
      500
    );
  }
});

/**
 * GET /api/importexport/zip - 导出整个博客为 ZIP
 */
app.get('/zip', adminMiddleware, async (c) => {
  try {
    const result = await exportBlogAsZip(c.env);

    return c.body(result.data as any, 200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: (error as Error).message,
      },
      500
    );
  }
});

export default app;
