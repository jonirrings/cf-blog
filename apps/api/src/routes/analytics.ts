/**
 * 访问统计相关 API 路由
 *
 * - POST /api/analytics/record - 记录页面访问
 * - GET /api/analytics/views/:postId - 获取页面访问数
 * - GET /api/analytics/views/batch - 批量获取页面访问数
 * - GET /api/analytics/trend/hourly - 获取小时级趋势
 * - GET /api/analytics/trend/daily - 获取天级趋势
 * - GET /api/analytics/top - 获取热门页面
 * - GET /api/analytics/referer/:postId - 获取来源统计
 * - POST /api/analytics/sync - 同步 Cloudflare Analytics（管理员）
 */

import { Hono } from 'hono';
import type { Env } from '../index';
import { adminMiddleware } from '../auth/middleware';
import { recordVisit, getVisitCount, getVisitCounts } from '../analytics/counter';
import { getHourlyTrend, getDailyTrend, getTopPages, getRefererStats } from '../analytics/stats';
import { batchSyncAnalytics } from '../analytics/sync';
import { shouldCountVisit } from '../analytics/crawler';

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/analytics/record - 记录页面访问
 */
app.post('/record', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { postId } = body;

  if (!postId) {
    return c.json({ success: false, error: 'postId is required' }, 400);
  }

  // 检查是否应该计数（排除爬虫）
  if (!shouldCountVisit(c.req.raw)) {
    return c.json({ success: true, recorded: false, reason: 'bot_or_crawler' });
  }

  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const userAgent = c.req.header('User-Agent') || '';
  const userId = (c as any).session?.userId;

  const result = await recordVisit(c.env.CACHE_KV, postId, ip, userAgent, userId);

  return c.json({
    success: true,
    recorded: result.recorded,
    count: result.count,
  });
});

/**
 * GET /api/analytics/views/:postId - 获取页面访问数
 */
app.get('/views/:postId', async (c) => {
  const postId = c.req.param('postId');
  const count = await getVisitCount(c.env.CACHE_KV, postId);
  return c.json({ success: true, postId, count });
});

/**
 * GET /api/analytics/views/batch - 批量获取页面访问数
 */
app.get('/views/batch', async (c) => {
  const postIds = c.req.query('ids')?.split(',') || [];
  if (postIds.length === 0) {
    return c.json({ success: false, error: 'No post IDs provided' }, 400);
  }

  const counts = await getVisitCounts(c.env.CACHE_KV, postIds);
  const result = Object.fromEntries(counts);

  return c.json({ success: true, counts: result });
});

/**
 * GET /api/analytics/trend/hourly - 获取小时级趋势
 */
app.get('/trend/hourly', async (c) => {
  const hours = parseInt(c.req.query('hours') || '24', 10);
  const trend = await getHourlyTrend(c.env.CACHE_KV, Math.min(hours, 168)); // 最多 7 天
  return c.json({ success: true, trend });
});

/**
 * GET /api/analytics/trend/daily - 获取天级趋势
 */
app.get('/trend/daily', async (c) => {
  const days = parseInt(c.req.query('days') || '7', 10);
  const trend = await getDailyTrend(c.env.CACHE_KV, Math.min(days, 30)); // 最多 30 天
  return c.json({ success: true, trend });
});

/**
 * GET /api/analytics/top - 获取热门页面
 */
app.get('/top', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const topPages = await getTopPages(c.env.CACHE_KV, Math.min(limit, 100));
  return c.json({ success: true, topPages });
});

/**
 * GET /api/analytics/referer/:postId - 获取来源统计
 */
app.get('/referer/:postId', async (c) => {
  const postId = c.req.param('postId');
  const referers = await getRefererStats(c.env.CACHE_KV, postId);
  return c.json({ success: true, postId, referers });
});

/**
 * POST /api/analytics/sync - 同步 Cloudflare Analytics（管理员）
 */
app.post('/sync', adminMiddleware, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { postIds } = body;

  if (!postIds || !Array.isArray(postIds)) {
    return c.json({ success: false, error: 'postIds array is required' }, 400);
  }

  // 从环境变量获取 Cloudflare API 配置
  const apiToken = c.env.CLOUDFLARE_API_TOKEN;
  const accountId = c.env.CLOUDFLARE_ACCOUNT_ID;
  const zoneId = c.env.CLOUDFLARE_ZONE_ID;

  if (!apiToken || !accountId || !zoneId) {
    return c.json(
      {
        success: false,
        error: 'Cloudflare API credentials not configured',
      },
      500
    );
  }

  const results = await batchSyncAnalytics(c.env.CACHE_KV, apiToken, accountId, zoneId, postIds);

  return c.json({
    success: true,
    results: Object.fromEntries(results),
  });
});

export default app;
