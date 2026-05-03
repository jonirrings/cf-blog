import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * 创建 D1 数据库连接
 * @param d1 Cloudflare D1 数据库实例
 * @returns Drizzle 数据库客户端
 */
export function createDb(d1: D1Database): DrizzleD1Database<typeof schema> {
  return drizzle(d1, { schema });
}

/**
 * 从 Cloudflare Workers 环境获取数据库客户端
 * @param env Cloudflare Workers 环境对象
 * @returns Drizzle 数据库客户端
 */
export function getDb(env: { DB: D1Database }): DrizzleD1Database<typeof schema> {
  return createDb(env.DB);
}

// 导出 schema 供直接引用
export * from './schema';
