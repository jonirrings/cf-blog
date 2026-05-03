/**
 * Cloudflare Workers - Hono API 后端
 *
 * 负责：
 * - RESTful API 路由
 * - WebSocket 连接管理
 * - 认证和权限中间件
 * - 业务逻辑处理
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

// Durable Objects 类导出（wrangler 需要）
export { PresenceDO } from './websocket/PresenceDO';
export { RoomDO } from './websocket/RoomDO';
export { HomeDO } from './websocket/HomeDO';

// 类型定义
export interface Env {
  // D1 数据库
  DB: D1Database;

  // KV 命名空间
  CONFIG_KV: KVNamespace;
  CACHE_KV: KVNamespace;
  USER_KV: KVNamespace;

  // R2 存储桶
  IMAGES_R2: R2Bucket;

  // Durable Objects
  PRESENCE_DO: DurableObjectNamespace;
  ROOM_DO: DurableObjectNamespace;
  HOME_DO: DurableObjectNamespace;

  // 环境变量
  ENVIRONMENT: string;
  SITE_URL: string;

  // Turnstile
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;

  // GitHub OAuth
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;

  // Cloudflare Analytics API
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_ZONE_ID?: string;

  // JWT Secret
  JWT_SECRET?: string;
}

// 创建 Hono 应用
const app = new Hono<{ Bindings: Env }>();

// 全局中间件
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    maxAge: 86400,
  })
);

// 健康检查
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});

// WebSocket 路由 - 在线人数统计
app.get('/ws/presence', async (c) => {
  const id = c.env.PRESENCE_DO.idFromName('global');
  const stub = c.env.PRESENCE_DO.get(id);
  return stub.fetch(c.req.raw);
});

// WebSocket 路由 - 文章房间
app.get('/ws/room', async (c) => {
  const postId = c.req.query('postId') || 'default';
  const id = c.env.ROOM_DO.idFromName(postId);
  const stub = c.env.ROOM_DO.get(id);
  return stub.fetch(c.req.raw);
});

// WebSocket 路由 - 首页房间
app.get('/ws/home', async (c) => {
  const id = c.env.HOME_DO.idFromName('home');
  const stub = c.env.HOME_DO.get(id);
  return stub.fetch(c.req.raw);
});

// API 路由注册
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import commentRoutes from './routes/comments';
import userRoutes from './routes/users';
import configRoutes from './routes/config';
import statsRoutes from './routes/stats';
import analyticsRoutes from './routes/analytics';
import importExportRoutes from './routes/importexport';
import seedRoutes from './routes/seed';

app.route('/api/auth', authRoutes);
app.route('/api/posts', postRoutes);
app.route('/api/comments', commentRoutes);
app.route('/api/users', userRoutes);
app.route('/api/config', configRoutes);
app.route('/api/stats', statsRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/importexport', importExportRoutes);
app.route('/api/seed', seedRoutes);

// 404 处理
app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found', path: c.req.path }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error('[API Error]', err);
  return c.json({ success: false, error: err.message }, 500);
});

export default app;
