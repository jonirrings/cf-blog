<script lang="ts">
  import { onMount } from 'svelte';
  import { t, locale } from '$lib/i18n';

  interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    created_at: string;
  }

  let posts = $state<Post[]>([]);
  let loading = $state(true);
  let currentLocale = $state<string>('zh-CN');

  onMount(async () => {
    locale.subscribe((val) => {
      currentLocale = val;
    });
    try {
      const res = await fetch('/api/posts');
      const { data } = await res.json();
      posts = data || [];
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      loading = false;
    }
  });

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(currentLocale === 'zh-CN' ? 'zh-CN' : 'en');
  }
</script>

<section>
  <h2 class="text-2xl font-semibold mb-4">{t('site.latestPosts')}</h2>

  {#if loading}
    <p class="text-gray-500">{t('common.loading')}</p>
  {:else if posts.length === 0}
    <p class="text-gray-500">{t('site.noPosts')}</p>
  {:else}
    <ul class="space-y-4">
      {#each posts as post}
        <li class="p-4 bg-white rounded-lg shadow">
          <a
            href="/svelte/post/{post.slug}"
            class="text-xl font-semibold text-blue-600 hover:underline"
          >
            {post.title}
          </a>
          {#if post.excerpt}
            <p class="text-gray-600 mt-2">{post.excerpt}</p>
          {/if}
          <p class="text-sm text-gray-400 mt-2">
            {formatDate(post.created_at)}
          </p>
        </li>
      {/each}
    </ul>
  {/if}
</section>
