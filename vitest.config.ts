/**
 * Vitest 单元测试配置
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/**/src/**/*.ts', 'apps/api/src/**/*.ts'],
      exclude: ['**/*.d.ts', '**/index.ts'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@cf-blog/db': path.resolve(__dirname, './packages/db/src'),
      '@cf-blog/i18n': path.resolve(__dirname, './packages/i18n/src'),
    },
  },
});
