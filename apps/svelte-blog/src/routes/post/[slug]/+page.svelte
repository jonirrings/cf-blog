<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { t } from '$lib/i18n';

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

  $derived(slug = $page.params.slug);

  onMount(async () => {
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
    return new Date(dateString).toLocaleDateString();
  }
</script>

<main class="min-h-screen p-8">
  <article class="max-w-4xl mx-auto">
    {#if loading}
      <p class="text-gray-500">{t('common.loading')}</p>
    {:else if post}
      <nav class="mb-4">
        <a href="/svelte/" class="text-blue-600 hover:underline">
          {t('site.backToHome')}
        </a>
      </nav>

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

    <nav class="mt-8 p-4 bg-gray-100 rounded-lg">
      <span class="font-semibold mr-3 text-sm">{t('site.frameworkSwitch')}</span>
      <a href="/next/" class="text-blue-600 hover:underline text-sm mr-3">{t('framework.next')}</a>
      <a href="/nuxt/" class="text-green-600 hover:underline text-sm mr-3">{t('framework.nuxt')}</a>
      <a href="/svelte/" class="text-orange-600 font-semibold text-sm">{t('framework.svelte')}</a>
      <a href="/astro/" class="text-purple-600 hover:underline text-sm mr-3">{t('framework.astro')}</a>
      <a href="/solid/" class="text-cyan-600 hover:underline text-sm">{t('framework.solid')}</a>
    </nav>
  </article>
</main>
