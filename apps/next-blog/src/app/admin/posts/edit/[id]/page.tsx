'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Editor } from '@/components/editor';
import { useTranslation } from '@/lib/i18n';
import type { JSONContent } from '@tiptap/core';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  framework: 'next' | 'nuxt' | 'svelte' | 'astro' | 'solid';
  status: 'draft' | 'published';
  coverImage?: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<JSONContent | undefined>(undefined);
  const [formData, setFormData] = useState<Post>({
    id: 0,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    framework: 'next',
    status: 'draft',
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        const { data } = await res.json();
        if (data) {
          setFormData(data);
          // 解析内容 JSON
          try {
            const parsed = JSON.parse(data.content);
            setContent(parsed);
          } catch {
            // 如果不是 JSON，使用默认内容
          }
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content: content ? JSON.stringify(content) : '',
        }),
      });

      if (res.ok) {
        router.push('/admin/posts');
      } else {
        const error = await res.json();
        alert(`${t('post.updateFailed')}: ${error.message || ''}`);
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert(t('post.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div>
      <nav className="mb-6">
        <Link href="/admin/posts" className="text-blue-600 hover:underline">
          {t('post.backToList')}
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('post.editPost')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              {t('post.title')}
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData({ ...formData, title });
                const slug = title
                  .toLowerCase()
                  .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
                  .replace(/[\s-]+/g, '-')
                  .trim();
                setFormData({ ...formData, slug });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('post.titlePlaceholder')}
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              {t('post.slug')}
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('post.slugPlaceholder')}
              required
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              {t('post.excerpt')}
            </label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('post.excerptPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="framework" className="block text-sm font-medium text-gray-700 mb-1">
                {t('post.framework')}
              </label>
              <select
                id="framework"
                value={formData.framework}
                onChange={(e) =>
                  setFormData({ ...formData, framework: e.target.value as Post['framework'] })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="next">{t('framework.next')}</option>
                <option value="nuxt">{t('framework.nuxt')}</option>
                <option value="svelte">{t('framework.svelte')}</option>
                <option value="astro">{t('framework.astro')}</option>
                <option value="solid">{t('framework.solid')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                {t('post.status')}
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Post['status'] })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">{t('post.status.draft')}</option>
                <option value="published">{t('post.publish')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 编辑器 */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('post.content')}
          </label>
          <Editor initialContent={content} onContentChange={setContent} />
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('post.saving') : t('post.saveChanges')}
          </button>
          <Link
            href="/admin/posts"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
          >
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
