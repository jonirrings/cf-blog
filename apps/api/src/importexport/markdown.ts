/**
 * Markdown 导出
 *
 * 功能：
 * - 导出单篇文章为 Markdown（含 Front Matter）
 * - 批量导出所有文章
 * - HTML → Markdown 转换
 */

import type { Env } from "../index";

export interface MarkdownExportResult {
  slug: string;
  filename: string;
  content: string;
}

/**
 * HTML 转 Markdown（简化版）
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return "";

  let md = html;

  // 替换标题
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gis, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gis, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gis, "### $1\n\n");
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gis, "#### $1\n\n");
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gis, "##### $1\n\n");
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gis, "###### $1\n\n");

  // 替换粗体和斜体
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gis, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gis, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gis, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gis, "*$1*");

  // 替换链接
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis, "[$2]($1)");

  // 替换图片
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gis, "![$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/gis, "![]($1)");

  // 替换列表
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gis, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gis, "- $1\n");
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gis, (match, content) => {
    let index = 1;
    return content.replace(/<li[^>]*>(.*?)<\/li>/gis, () => `${index++}. $1\n`);
  });

  // 替换引用
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gis, "> $1\n");

  // 替换代码块
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gis, "```$1\n```");
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gis, "`$1`");

  // 替换段落
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gis, "$1\n\n");

  // 替换换行
  md = md.replace(/<br[^>]*>/gis, "\n");

  // 移除剩余 HTML 标签
  md = md.replace(/<[^>]+>/g, "");

  // 清理多余空行
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

/**
 * 生成 Front Matter
 */
function generateFrontMatter(post: {
  title: string;
  slug: string;
  excerpt?: string | null;
  tags?: string[];
  status: string;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}): string {
  const lines: string[] = ["---"];
  lines.push(`title: "${post.title.replace(/"/g, '\\"')}"`);
  lines.push(`slug: ${post.slug}`);

  if (post.excerpt) {
    lines.push(`excerpt: "${post.excerpt.replace(/"/g, '\\"')}"`);
  }

  if (post.tags && post.tags.length > 0) {
    lines.push(`tags: [${post.tags.map((t) => `"${t}"`).join(", ")}]`);
  }

  lines.push(`status: ${post.status}`);
  lines.push(`created_at: ${post.created_at}`);
  lines.push(`updated_at: ${post.updated_at}`);

  if (post.published_at) {
    lines.push(`published_at: ${post.published_at}`);
  }

  lines.push("---");
  lines.push("");

  return lines.join("\n");
}

/**
 * 导出单篇文章为 Markdown
 */
export async function exportPostAsMarkdown(
  env: Env,
  postId: string,
): Promise<MarkdownExportResult | null> {
  const post = (await env.DB.prepare(
    `SELECT p.*, GROUP_CONCAT(t.name) as tags
     FROM posts p
     LEFT JOIN post_tags pt ON p.id = pt.post_id
     LEFT JOIN tags t ON pt.tag_id = t.id
     WHERE p.id = ?
     GROUP BY p.id`,
  )
    .bind(postId)
    .first()) as any;

  if (!post) {
    return null;
  }

  const tags = post.tags ? post.tags.split(",").filter(Boolean) : [];
  const frontMatter = generateFrontMatter({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    tags,
    status: post.status,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at,
  });

  const content = frontMatter + htmlToMarkdown(post.content);

  return {
    slug: post.slug,
    filename: `${post.slug}.md`,
    content,
  };
}

/**
 * 批量导出所有文章
 */
export async function exportAllPostsAsMarkdown(env: Env): Promise<MarkdownExportResult[]> {
  const posts = (await env.DB.prepare(
    `SELECT p.*, GROUP_CONCAT(t.name) as tags
     FROM posts p
     LEFT JOIN post_tags pt ON p.id = pt.post_id
     LEFT JOIN tags t ON pt.tag_id = t.id
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
  ).all()) as any;

  const results: MarkdownExportResult[] = [];

  for (const post of posts.results || []) {
    const tags = post.tags ? post.tags.split(",").filter(Boolean) : [];
    const frontMatter = generateFrontMatter({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      tags,
      status: post.status,
      created_at: post.created_at,
      updated_at: post.updated_at,
      published_at: post.published_at,
    });

    const content = frontMatter + htmlToMarkdown(post.content);

    results.push({
      slug: post.slug,
      filename: `${post.slug}.md`,
      content,
    });
  }

  return results;
}
