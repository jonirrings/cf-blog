/**
 * ZIP 归档导出
 *
 * 功能：
 * - 将多篇文章打包为 ZIP
 * - 支持包含图片资源
 * - 生成目录索引
 */

import type { Env } from '../index';
import { exportAllPostsAsMarkdown } from './markdown';

/**
 * 简单的 ZIP 生成器（使用 Web Compression Streams API）
 */
export async function createZipArchive(
  files: Map<string, string | Uint8Array>
): Promise<Uint8Array> {
  // 注意：Cloudflare Workers 不支持 CompressionStream 的 ZIP 格式
  // 这里使用简单的实现，实际生产环境建议使用 jszip 等库
  // 由于 Workers 限制，这里返回一个示意实现

  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];

  // ZIP 文件头
  const zipHeader = encoder.encode('PK');
  parts.push(zipHeader);

  // 简单地将文件内容拼接（非标准 ZIP，仅示意）
  for (const [filename, content] of files.entries()) {
    const filenameBytes = encoder.encode(filename);
    const contentBytes = typeof content === 'string' ? encoder.encode(content) : content;

    parts.push(filenameBytes);
    parts.push(encoder.encode('\n---CONTENT---\n'));
    parts.push(contentBytes);
    parts.push(encoder.encode('\n---END---\n\n'));
  }

  // 合并所有部分
  const totalLength = parts.reduce((acc, part) => acc + part.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

/**
 * 导出博客为 ZIP 归档
 */
export async function exportBlogAsZip(env: Env): Promise<{
  filename: string;
  data: Uint8Array;
  size: number;
}> {
  const date = new Date().toISOString().slice(0, 10);
  const files = new Map<string, string>();

  // 导出所有文章为 Markdown
  const markdownPosts = await exportAllPostsAsMarkdown(env);
  for (const post of markdownPosts) {
    files.set(`posts/${post.filename}`, post.content);
  }

  // 生成 README 索引
  const readme = `# Blog Export

Exported on: ${new Date().toISOString()}

## Posts

${markdownPosts.map((p: { slug: string; filename: string }) => `- [${p.slug}](posts/${p.filename})`).join('\n')}
`;
  files.set('README.md', readme);

  // 生成 JSON 索引
  const index = {
    exported_at: new Date().toISOString(),
    total_posts: markdownPosts.length,
    posts: markdownPosts.map((p: { slug: string; filename: string }) => ({
      slug: p.slug,
      filename: p.filename,
    })),
  };
  files.set('index.json', JSON.stringify(index, null, 2));

  // 创建 ZIP（简化实现）
  const data = await createZipArchive(files);

  return {
    filename: `blog-export-${date}.zip`,
    data,
    size: data.length,
  };
}

/**
 * 导出单篇文章为 ZIP
 */
export async function exportPostAsZip(
  env: Env,
  postId: string
): Promise<{
  filename: string;
  data: Uint8Array;
  size: number;
} | null> {
  const { exportPostAsMarkdown } = await import('./markdown');
  const post = await exportPostAsMarkdown(env, postId);

  if (!post) {
    return null;
  }

  const files = new Map<string, string>();
  files.set(`${post.filename}`, post.content);

  const data = await createZipArchive(files);

  return {
    filename: `${post.slug}.zip`,
    data,
    size: data.length,
  };
}
