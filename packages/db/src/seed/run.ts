/**
 * 种子数据执行脚本
 *
 * 通过 wrangler d1 execute 执行 SQL 来操作本地/远程 D1 数据库
 *
 * 使用方法:
 * pnpm db:seed          - 插入种子数据（本地）
 * pnpm db:seed:clear    - 清除种子数据（本地）
 * pnpm db:seed:remote   - 插入种子数据（远程）
 * pnpm db:seed:clear:remote - 清除种子数据（远程）
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const execAsync = promisify(exec);
const projectRoot = path.join(__dirname, '..', '..', '..');

const clearSQL = `
DELETE FROM comments;
DELETE FROM posts_to_tags;
DELETE FROM posts;
DELETE FROM tags;
DELETE FROM authors;
DELETE FROM users;
`;

const seedSQL = `
INSERT OR IGNORE INTO users (id, github_id, email, name, avatar, role, is_approved, publisher_application_status, created_at, updated_at) VALUES
(1, NULL, 'admin@example.com', '管理员', NULL, 'admin', 1, 'none', datetime('now'), datetime('now')),
(2, NULL, 'publisher@example.com', '发布者', NULL, 'publisher', 1, 'approved', datetime('now'), datetime('now')),
(3, NULL, 'commenter@example.com', '评论者', NULL, 'commenter', 1, 'none', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO authors (id, user_id, name, email, bio, created_at) VALUES
(1, 2, '发布者', 'publisher@example.com', '热爱写作，分享技术心得', datetime('now'));

INSERT OR IGNORE INTO tags (id, name, slug) VALUES
(1, 'Next.js', 'nextjs'),
(2, 'Nuxt', 'nuxt'),
(3, 'SvelteKit', 'sveltekit'),
(4, 'Astro', 'astro'),
(5, 'Solid', 'solid'),
(6, 'Cloudflare', 'cloudflare'),
(7, '教程', 'tutorial'),
(8, '技术', 'tech');

INSERT OR IGNORE INTO posts (id, slug, title, excerpt, content, status, framework, author_id, view_count, unique_view_count, created_at, updated_at, published_at) VALUES
(1, 'welcome-to-cf-blog', '欢迎来到 Cloudflare 博客', '这是一个支持五框架切换的博客系统', '<h2>项目介绍</h2><p>这是一个多框架博客系统。</p>', 'published', 'next', 1, 100, 80, datetime('now', '-7 days'), datetime('now'), datetime('now', '-7 days')),
(2, 'nextjs-ssg-guide', 'Next.js 14 静态导出指南', '学习如何使用 Next.js 14 的静态导出功能', '<h2>Next.js 14 静态导出</h2>', 'published', 'next', 1, 50, 40, datetime('now', '-5 days'), datetime('now'), datetime('now', '-5 days')),
(3, 'nuxt-3-ssg', 'Nuxt 3 SSG 实战', '使用 Nuxt 3 构建静态博客', '<h2>Nuxt 3 SSG 配置</h2>', 'published', 'nuxt', 1, 35, 28, datetime('now', '-4 days'), datetime('now'), datetime('now', '-4 days')),
(4, 'sveltekit-5-runes', 'SvelteKit 2 + Svelte 5 Runes 详解', '深入了解 Svelte 5 的 Runes 响应式系统', '<h2>Svelte 5 Runes</h2>', 'published', 'svelte', 1, 42, 35, datetime('now', '-3 days'), datetime('now'), datetime('now', '-3 days')),
(5, 'astro-5-islands', 'Astro 5 Islands Architecture', '探索 Astro 5 的 Islands 架构', '<h2>Astro 5 Islands</h2>', 'published', 'astro', 1, 38, 30, datetime('now', '-2 days'), datetime('now'), datetime('now', '-2 days')),
(6, 'solidstart-fine-grained', 'SolidStart 细粒度响应式', 'SolidJS 的细粒度响应式系统', '<h2>SolidJS 响应式</h2>', 'published', 'solid', 1, 25, 20, datetime('now', '-1 days'), datetime('now'), datetime('now', '-1 days'));

INSERT OR IGNORE INTO posts_to_tags (post_id, tag_id) VALUES
(1, 6), (1, 8), (2, 1), (2, 7), (3, 2), (3, 7), (4, 3), (4, 8), (5, 4), (5, 7), (6, 5), (6, 8);

INSERT OR IGNORE INTO comments (id, post_id, user_id, content, user_approved, post_approved, rejected, created_at, updated_at) VALUES
(1, 1, 3, '很棒的项目！', 1, 1, 0, datetime('now', '-6 days'), datetime('now')),
(2, 1, 3, '请问支持 SSR 吗？', 1, 1, 0, datetime('now', '-5 days'), datetime('now')),
(3, 2, 3, '很实用！', 1, 0, 0, datetime('now', '-4 days'), datetime('now')),
(4, 3, 3, 'Nuxt 3 的 DX 很好。', 0, 0, 0, datetime('now', '-3 days'), datetime('now'));
`;

async function runSQL(sql: string, local: boolean) {
  const localArg = local ? '--local' : '';
  const configArg = local ? '--config wrangler.dev.toml' : '--config wrangler.toml';

  // Write SQL to a temp file since wrangler --file doesn't support stdin
  const tmpFile = path.join(os.tmpdir(), `cf-blog-seed-${Date.now()}.sql`);
  fs.writeFileSync(tmpFile, sql, 'utf-8');

  try {
    const cmd = `wrangler d1 execute cf-blog-db ${localArg} ${configArg} --file ${tmpFile}`;
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: projectRoot,
      env: process.env,
    });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error: unknown) {
    const e = error as { stdout?: string; stderr?: string; message?: string };
    if (e.stdout) console.log(e.stdout);
    if (e.stderr) console.error(e.stderr);
    throw error;
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const isRemote = args.includes('--remote');
  const isLocal = !isRemote;

  console.log('🌱 Cloudflare Blog 种子数据脚本');
  console.log('================================');
  console.log(`模式：${isRemote ? '🌐 远程数据库' : '💻 本地数据库'}`);
  console.log('');

  try {
    if (command === 'clear') {
      console.log('🗑️  开始清除种子数据...');
      await runSQL(clearSQL, isLocal);
      console.log('✅ 数据清除完成！');
    } else {
      console.log('📝 开始插入种子数据...');
      await runSQL(seedSQL, isLocal);
      console.log('✅ 种子数据插入完成！');
      console.log('');
      console.log('📊 插入的数据:');
      console.log('   - 3 个用户 (admin, publisher, commenter)');
      console.log('   - 1 个作者');
      console.log('   - 8 个标签');
      console.log('   - 6 篇文章 (覆盖 5 个框架)');
      console.log('   - 4 条评论');
    }

    console.log('');
    console.log('================================');
    console.log('💡 提示:');
    console.log('   - 管理员账号：admin@example.com');
    console.log('   - 发布者账号：publisher@example.com');
    console.log('   - 评论者账号：commenter@example.com');
    console.log('');
    console.log('🔗 访问管理后台：http://localhost:8788/next/admin');
    console.log('');

    process.exit(0);
  } catch (error: unknown) {
    const e = error as { message?: string };
    console.error('❌ 错误:', e.message || error);
    process.exit(1);
  }
}

main();
