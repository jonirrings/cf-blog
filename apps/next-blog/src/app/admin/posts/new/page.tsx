'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Editor } from '@/components/editor';
import { useTranslation } from '@/lib/i18n';
import type { JSONContent } from '@tiptap/core';

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  framework: 'next' | 'nuxt' | 'svelte' | 'astro' | 'solid';
  status: 'draft' | 'published';
  coverImage?: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<JSONContent | undefined>(undefined);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    framework: 'next',
    status: 'draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
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
        alert(`${t('post.createFailed')}: ${error.message || ''}`);
      }
    } catch (err) {
      console.error('Create post failed:', err);
      alert(t('post.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({ ...formData, title });
    // 自动生成 slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .trim();
    setFormData({ ...formData, slug });
  };

  return (
    <div>
      <nav className="mb-6">
        <Link href="/admin/posts" className="text-blue-600 hover:underline">
          {t('post.backToList')}
        </Link>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('post.createPost')}</h1>

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
              onChange={handleTitleChange}
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
                  setFormData({ ...formData, framework: e.target.value as FormData['framework'] })
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
                  setFormData({ ...formData, status: e.target.value as FormData['status'] })
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
          <Editor onContentChange={setContent} />
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t('post.saving')
              : formData.status === 'published'
                ? t('post.publishPost')
                : t('post.saveDraft')}
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
