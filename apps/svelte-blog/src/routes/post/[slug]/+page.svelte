<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { t, locale } from '$lib/i18n';

  interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    created_at: string;
    updated_at: string;
  }

  let post = $state<Post | null>(null);
  let loading = $state(true);
  let currentLocale = $state<string>('zh-CN');

  $derived(slug = $page.params.slug);

  onMount(async () => {
    locale.subscribe((val) => {
      currentLocale = val;
    });
    try {
      const res = await fetch(`/api/posts/${slug}`);
      const { data } = await res.json();
      post = data || null;
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      loading = false;
    }
  });

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(currentLocale === 'zh-CN' ? 'zh-CN' : 'en');
  }
</script>

<article>
  {#if loading}
    <p class="text-gray-500">{t('common.loading')}</p>
  {:else if post}
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">{post.title}</h1>
      <div class="text-sm text-gray-500 space-x-4">
        <span>{t('site.publishedAt')} {formatDate(post.created_at)}</span>
        {#if post.updated_at !== post.created_at}
          <span>{t('site.updatedAt')} {formatDate(post.updated_at)}</span>
        {/if}
      </div>
    </header>

    {#if post.excerpt}
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <p class="text-gray-700 italic">{post.excerpt}</p>
      </div>
    {/if}

    <div class="prose prose-lg max-w-none" v-html={post.content} />
  {:else}
    <div class="text-center">
      <p class="text-gray-500">{t('site.postNotExist')}</p>
    </div>
  {/if}
</article>
