<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/i18n';

  interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    created_at: string;
  }

  let posts = $state<Post[]>([]);
  let loading = $state(true);

  onMount(async () => {
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
    return new Date(dateString).toLocaleDateString();
  }
</script>

<main class="min-h-screen p-8">
  <div class="max-w-4xl mx-auto">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">SvelteKit Blog</h1>
      <p class="text-gray-600">{t('site.poweredBy')}</p>
    </header>

    <nav class="mb-8 p-4 bg-gray-100 rounded-lg">
      <span class="font-semibold mr-4">{t('site.frameworkSwitch')}</span>
      <a href="/next/" class="text-blue-600 hover:underline mr-4">{t('framework.next')}</a>
      <a href="/nuxt/" class="text-green-600 hover:underline mr-4">{t('framework.nuxt')}</a>
      <a href="/svelte/" class="text-orange-600 hover:underline">{t('framework.svelte')}</a>
      <a href="/astro/" class="text-purple-600 hover:underline mr-4">{t('framework.astro')}</a>
      <a href="/solid/" class="text-cyan-600 hover:underline">{t('framework.solid')}</a>
    </nav>

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
  </div>
</main>
