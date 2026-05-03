/**
 * Cloudflare Workers - Shell 路由层
 *
 * 负责:
 * - URL 前缀路由分发 (/next/*, /nuxt/*, /svelte/*, /astro/*, /solid/*)
 * - API 路由处理
 * - 静态资源分发
 * - 认证和权限中间件
 */

import apiApp from '@cf-blog/api';
import { getDb } from '@cf-blog/db/client';

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

  // Turnstile
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;

  // GitHub OAuth
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const db = getDb(env);

    // CORS 预检请求
    if (request.method === 'OPTIONS') {
      return handleCors(request);
    }

    // 健康检查
    if (path === '/health') {
      return json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // API 路由
    if (path.startsWith('/api/')) {
      return handleApi(request, env, db);
    }

    // Durable Objects 路由
    if (path.startsWith('/presence/') || path.startsWith('/room/') || path.startsWith('/home/')) {
      return handleDurableObjects(request, env);
    }

    // 静态资源路由 (由 Pages 处理，这里只做占位)
    if (
      path.startsWith('/next/') ||
      path.startsWith('/nuxt/') ||
      path.startsWith('/svelte/') ||
      path.startsWith('/astro/') ||
      path.startsWith('/solid/')
    ) {
      return handleStaticAssets(request, env);
    }

    // 根路径重定向到 /next/
    if (path === '/') {
      return Response.redirect(new URL('/next/', url));
    }

    // 404
    return new Response('Not Found', { status: 404 });
  },
};

/**
 * CORS 处理
 */
function handleCors(_request: Request): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * API 路由处理
 */
async function handleApi(request: Request, env: Env, db: unknown): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // 健康检查 API
  if (path === '/api/health') {
    return json({ status: 'ok', database: 'connected' });
  }

  // 使用 Hono 处理 API 请求
  try {
    const response = await apiApp.fetch(request, env);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Durable Objects 路由处理
 */
async function handleDurableObjects(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Presence DO - 全局在线人数
  if (path.startsWith('/presence/')) {
    const id = env.PRESENCE_DO.idFromName('global');
    const stub = env.PRESENCE_DO.get(id);
    return stub.fetch(request);
  }

  // Room DO - 文章房间
  if (path.startsWith('/room/')) {
    const postId = url.searchParams.get('postId') || 'default';
    const id = env.ROOM_DO.idFromName(postId);
    const stub = env.ROOM_DO.get(id);
    return stub.fetch(request);
  }

  // Home DO - 首页房间
  if (path.startsWith('/home/')) {
    const id = env.HOME_DO.idFromName('home');
    const stub = env.HOME_DO.get(id);
    return stub.fetch(request);
  }

  return new Response('Not Found', { status: 404 });
}

/**
 * 静态资源处理（占位，实际由 Pages 处理）
 */
async function handleStaticAssets(_request: Request, _env: Env): Promise<Response> {
  // 在 Pages 部署模式下，静态资源由 Pages 自动处理
  // 本地开发时可能需要手动配置
  return new Response('Static assets should be served by Pages', { status: 404 });
}

/**
 * JSON 响应工具
 */
function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init.headers,
      'Content-Type': 'application/json',
    },
  });
}
