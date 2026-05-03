<script lang="ts">
import { t } from '$lib/i18n';
import { goto } from '$app/navigation';
import RichTextEditor from '$lib/components/RichTextEditor.svelte';

interface JSONContent {
  type?: string;
  attrs?: Record<string, any>;
  content?: JSONContent[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
}

let formData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  framework: 'svelte' as 'next' | 'nuxt' | 'svelte' | 'astro' | 'solid',
  status: 'draft' as 'draft' | 'published',
};

let saving = false;

function handleTitleChange(e: Event) {
  const title = (e.target as HTMLInputElement).value;
  formData.title = title;
  formData.slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .trim();
}

function handleContentChange(content: JSONContent) {
  formData.content = JSON.stringify(content);
}

async function handleSubmit() {
  saving = true;
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      goto('/admin/posts');
    } else {
      const error = await res.json();
      alert(`${t('post.createFailed')}: ${error.message || t('form.error')}`);
    }
  } catch (error) {
    alert(t('post.createFailed'));
  } finally {
    saving = false;
  }
}
</script>

<div>
  <h1 class="text-2xl font-bold text-gray-900 mb-6">{t('post.new')}</h1>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            {t('post.title')}
          </label>
          <input
            type="text"
            id="title"
            bind:value={formData.title}
            on:input={handleTitleChange}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">
            {t('post.slug')}
          </label>
          <input
            type="text"
            id="slug"
            bind:value={formData.slug}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label for="excerpt" class="block text-sm font-medium text-gray-700 mb-1">
            {t('post.excerpt')}
          </label>
          <textarea
            id="excerpt"
            bind:value={formData.excerpt}
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="framework" class="block text-sm font-medium text-gray-700 mb-1">
              {t('post.framework')}
            </label>
            <select
              id="framework"
              bind:value={formData.framework}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="next">{t('framework.next')}</option>
              <option value="nuxt">{t('framework.nuxt')}</option>
              <option value="svelte">{t('framework.svelte')}</option>
              <option value="astro">{t('framework.astro')}</option>
              <option value="solid">{t('framework.solid')}</option>
            </select>
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
              {t('post.status')}
            </label>
            <select
              id="status"
              bind:value={formData.status}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">{t('post.status.draft')}</option>
              <option value="published">{t('post.status.published')}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {t('post.content')}
        </label>
        <RichTextEditor
          placeholder={t('post.contentPlaceholder')}
          onContentChange={handleContentChange}
        />
        <p class="text-xs text-gray-500 mt-1">{t('post.editorTip')}</p>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? t('common.loading') : t('common.save')}
        </button>
        <a
          href="/svelte/admin/posts"
          class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
        >
          {t('common.cancel')}
        </a>
      </div>
    </form>
</div>
