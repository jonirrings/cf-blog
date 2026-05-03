/**
 * Ghost 博客导入/导出
 *
 * 功能：
 * - 导入 Ghost JSON 格式数据
 * - 导出为 Ghost JSON 格式
 * - 数据格式转换
 */

import * as schema from '@cf-blog/db/schema';
import { posts as postsTable, tags as tagsTable } from '@cf-blog/db/schema';
import { drizzle } from 'drizzle-orm/d1';
import type { Env } from '../index';

export interface GhostExportData {
  meta: {
    exported_on: number;
    version: string;
  };
  data: {
    posts: GhostPost[];
    tags: GhostTag[];
    users: GhostUser[];
  };
}

export interface GhostPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  comment_id: string;
  feature_image?: string;
  featured: boolean;
  status: 'published' | 'draft';
  visibility: 'public' | 'members' | 'paid';
  created_at: string;
  updated_at: string;
  published_at?: string;
  custom_excerpt?: string;
  excerpt?: string;
  tags?: GhostTag[];
  primary_tag?: GhostTag;
  url?: string;
}

export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  feature_image?: string;
  parent?: GhostTag | null;
  meta_title?: string;
  meta_description?: string;
  visibility: 'public' | 'internal';
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  codeinjection_head?: string;
  codeinjection_foot?: string;
  canonical_url?: string;
  accent_color?: string;
  created_at: string;
  updated_at: string;
  url?: string;
}

export interface GhostUser {
  id: string;
  name: string;
  slug: string;
  profile_image?: string;
  cover_image?: string;
  bio?: string;
  website?: string;
  location?: string;
  facebook?: string;
  twitter?: string;
  meta_title?: string;
  meta_description?: string;
  url?: string;
}

/**
 * 从 Ghost JSON 导入数据
 */
export async function importFromGhost(
  env: Env,
  ghostData: GhostExportData
): Promise<{
  success: boolean;
  importedPosts: number;
  importedTags: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let importedPosts = 0;
  let importedTags = 0;

  const db = drizzle(env.DB, { schema });

  // 导入标签
  if (ghostData.data.tags) {
    for (const tag of ghostData.data.tags) {
      try {
        await db
          .insert(tagsTable)
          .values({
            name: tag.name,
            slug: tag.slug,
          })
          .onConflictDoNothing();
        importedTags++;
      } catch (error) {
        errors.push(`标签 "${tag.name}" 导入失败：${error}`);
      }
    }
  }

  // 导入文章
  if (ghostData.data.posts) {
    for (const post of ghostData.data.posts) {
      try {
        const excerpt =
          post.custom_excerpt || post.excerpt || post.html.slice(0, 200).replace(/<[^>]+>/g, '');

        await db
          .insert(postsTable)
          .values({
            title: post.title,
            slug: post.slug,
            content: post.html,
            excerpt,
            status: post.status === 'published' ? 'published' : 'draft',
            framework: 'next',
            coverImage: post.feature_image,
            publishedAt: post.published_at,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
          })
          .onConflictDoNothing();
        importedPosts++;
      } catch (error) {
        errors.push(`文章 "${post.title}" 导入失败：${error}`);
      }
    }
  }

  return {
    success: errors.length === 0,
    importedPosts,
    importedTags,
    errors,
  };
}

/**
 * 导出为 Ghost JSON 格式
 */
export async function exportToGhost(env: Env): Promise<GhostExportData> {
  const db = drizzle(env.DB, { schema });

  // 获取所有文章
  const posts = await db.query.posts.findMany({
    with: {
      tags: true,
    },
  });

  // 获取所有标签
  const tags = await db.query.tags.findMany();

  // 转换为 Ghost 格式
  const ghostPosts = posts.map((post: any) => ({
    id: post.id.toString(),
    uuid: crypto.randomUUID(),
    title: post.title,
    slug: post.slug,
    html: post.content,
    comment_id: post.id.toString(),
    feature_image: post.coverImage || undefined,
    featured: false,
    status: post.status,
    visibility: 'public' as const,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    published_at: post.publishedAt || undefined,
    custom_excerpt: post.excerpt || undefined,
    excerpt: post.excerpt || undefined,
    tags: post.tags?.map((pt: any) => ({
      id: pt.tags?.id?.toString() ?? pt.tagId?.toString() ?? '',
      name: pt.tags?.name ?? '',
      slug: pt.tags?.slug ?? '',
      visibility: 'public' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  }));

  const ghostTags = tags.map((tag: any) => ({
    id: tag.id.toString(),
    name: tag.name,
    slug: tag.slug,
    visibility: 'public' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return {
    meta: {
      exported_on: Date.now(),
      version: '5.0',
    },
    data: {
      posts: ghostPosts,
      tags: ghostTags,
      users: [],
    },
  };
}
