<script lang="ts">
import { onMount } from 'svelte';
import { t } from '$lib/i18n';

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  pendingComments: number;
  totalUsers: number;
  pendingUsers: number;
  totalViews: number;
}

let stats: Stats | null = null;
let loading = $state(true);

onMount(async () => {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success && data.data) {
      stats = data.data;
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  } finally {
    loading = false;
  }
});
</script>

<div>
  <h1 class="text-2xl font-bold text-gray-900 mb-6">{t('admin.dashboard')}</h1>

  {#if loading}
    <p class="text-gray-500">{t('common.loading')}</p>
  {:else if stats}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500">{t('stats.totalPosts')}</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalPosts}</p>
        <p class="text-sm text-gray-400 mt-1">
          {stats.publishedPosts} {t('post.status.published')} · {stats.draftPosts} {t('post.status.draft')}
        </p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500">{t('stats.totalComments')}</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalComments}</p>
        <p class="text-sm text-gray-400 mt-1">{stats.pendingComments} {t('comment.pending')}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500">{t('stats.totalUsers')}</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
        <p class="text-sm text-gray-400 mt-1">{stats.pendingUsers} {t('user.pending')}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500">{t('stats.totalViews')}</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{stats.totalViews}</p>
        <p class="text-sm text-gray-400 mt-1">{t('stats.totalViews.sub')}</p>
      </div>
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <a href="/svelte/admin/posts" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('post.management')}</h2>
      <p class="text-gray-500">{t('admin.quickActions.newPost')}</p>
    </a>
    <a href="/svelte/admin/comments" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('comment.management')}</h2>
      <p class="text-gray-500">{t('admin.quickActions.approveComments')}</p>
    </a>
    <a href="/svelte/admin/users" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('user.management')}</h2>
      <p class="text-gray-500">{t('admin.quickActions.userManagement')}</p>
    </a>
    <a href="/svelte/admin/settings" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('admin.settings')}</h2>
      <p class="text-gray-500">{t('admin.quickActions.settings')}</p>
    </a>
  </div>
</div>
