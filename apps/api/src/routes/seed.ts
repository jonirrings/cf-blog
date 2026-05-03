/**
 * 种子数据 API 端点
 *
 * 临时端点，用于在开发环境中执行种子数据
 * 生产环境请删除此文件
 */

import * as schema from '@cf-blog/db/schema';
import { clear as clearData, seed as seedData } from '@cf-blog/db/seed';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';

const seed = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// POST /api/seed - 执行种子数据插入
seed.post('/', async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    await seedData(db);
    return c.json({
      success: true,
      message: '种子数据插入成功',
    });
  } catch (error) {
    console.error('种子数据插入失败:', error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      },
      500
    );
  }
});

// DELETE /api/seed - 清除种子数据
seed.delete('/', async (c) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    await clearData(db);
    return c.json({
      success: true,
      message: '种子数据清除成功',
    });
  } catch (error) {
    console.error('种子数据清除失败:', error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      },
      500
    );
  }
});

export default seed;
