<script lang="ts">
import { t } from '$lib/i18n';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

interface Post {
  id: number;
  title: string;
  slug: string;
  framework: string;
  status: 'draft' | 'published';
  viewCount: number;
  createdAt: string;
}

let posts: Post[] = [];
let filter = 'all';
let loading = $state(true);

$derived(
  (filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    if (filter === 'published') return post.status === 'published';
    if (filter === 'draft') return post.status === 'draft';
    return true;
  }))
);

$derived((publishedCount = posts.filter((p) => p.status === 'published').length));
$derived((draftCount = posts.filter((p) => p.status === 'draft').length));

async function handleDelete(id: number) {
  if (!confirm(t('post.deleteConfirm'))) return;
  try {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      posts = posts.filter((p) => p.id !== id);
    }
  } catch (err) {
    console.error('Delete failed:', err);
  }
}

onMount(async () => {
  try {
    const res = await fetch('/api/posts');
    const data = await res.json();
    posts = data.data?.list || [];
  } catch (err) {
    console.error('Failed to fetch posts:', err);
  } finally {
    loading = false;
  }
});
</script>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">{t('post.management')}</h1>
    <a href="/svelte/admin/posts/new" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
      + {t('post.new')}
    </a>
  </div>

  <div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-lg font-semibold">{t('post.list')}</h2>
      <select
        bind:value={filter}
        class="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
      >
        <option value="all">{t('filter.all')} ({posts.length})</option>
        <option value="published">{t('filter.published')} ({publishedCount})</option>
        <option value="draft">{t('filter.draft')} ({draftCount})</option>
      </select>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('post.title')}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('post.framework')}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('post.status')}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('post.viewCount')}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('post.createdAt')}</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.edit')}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#if loading}
            <tr>
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">{t('common.loading')}</td>
            </tr>
          {:else if filteredPosts.length === 0}
            <tr>
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">{t('post.noPosts')}</td>
            </tr>
          {:else}
            {#each filteredPosts as post}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{post.title}</div>
                  <div class="text-sm text-gray-500">/{post.slug}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{post.framework}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs rounded-full {post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    {post.status === 'published' ? t('post.status.published') : t('post.status.draft')}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{post.viewCount}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-right space-x-3">
                  <a href="/svelte/post/{post.slug}" class="text-blue-600 hover:underline text-sm">{t('common.view')}</a>
                  <a href="/svelte/admin/posts/edit/{post.id}" class="text-green-600 hover:underline text-sm">{t('common.edit')}</a>
                  <button onclick={() => handleDelete(post.id)} class="text-red-600 hover:underline text-sm">{t('common.delete')}</button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
