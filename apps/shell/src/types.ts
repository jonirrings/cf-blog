/**
 * Cloudflare Workers 环境类型定义
 */

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

  // 网站配置
  SITE_URL: string; // blog.jonirrings.com

  // Turnstile
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;

  // GitHub OAuth
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

/**
 * Session 数据类型
 */
export interface SessionData {
  id: string;
  userId: number;
  userEmail: string;
  userName: string;
  userRole: 'admin' | 'publisher' | 'commenter';
  expiresAt: string;
  createdAt: string;
}

/**
 * API 响应类型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
