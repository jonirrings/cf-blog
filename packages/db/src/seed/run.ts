/**
 * 种子数据执行脚本
 *
 * 使用方法:
 * pnpm seed
 * pnpm seed:clear
 */

import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { seed, clear } from './index';

// 模拟 D1 数据库对象（实际运行时由 Wrangler 注入）
const mockD1Database: D1Database = {
  prepare: () => {
    throw new Error('D1 database not available in this environment');
  },
  dump: () => {
    throw new Error('D1 database not available in this environment');
  },
  batch: () => {
    throw new Error('D1 database not available in this environment');
  },
  exec: () => {
    throw new Error('D1 database not available in this environment');
  },
} as unknown as D1Database;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const db = drizzle(mockD1Database);

  try {
    if (command === 'clear') {
      console.log('🗑️  开始清除种子数据...');
      await clear(db);
    } else {
      console.log('🌱 开始执行种子数据...');
      await seed(db);
    }
    console.log('✅ 完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

main();
