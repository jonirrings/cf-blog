<template>
  <main class="min-h-screen p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8">
        <h1 class="text-4xl font-bold mb-2">Nuxt Blog</h1>
        <p class="text-gray-600">{{ t("site.poweredBy") }}</p>
      </header>

      <nav class="mb-8 p-4 bg-gray-100 rounded-lg">
        <span class="font-semibold mr-4">{{ t("site.frameworkSwitch") }}</span>
        <a href="/next/" class="text-blue-600 hover:underline mr-4">{{ t("framework.next") }}</a>
        <a href="/nuxt/" class="text-green-600 hover:underline mr-4">{{ t("framework.nuxt") }}</a>
        <a href="/svelte/" class="text-orange-600 hover:underline mr-4">{{
          t("framework.svelte")
        }}</a>
        <a href="/astro/" class="text-purple-600 hover:underline mr-4">{{
          t("framework.astro")
        }}</a>
        <a href="/solid/" class="text-blue-500 hover:underline">{{ t("framework.solid") }}</a>
      </nav>

      <section>
        <h2 class="text-2xl font-semibold mb-4">{{ t("site.latestPosts") }}</h2>
        <div v-if="posts.length === 0" class="text-gray-500">{{ t("site.noPosts") }}</div>
        <ul v-else class="space-y-4">
          <li v-for="post in posts" :key="post.id" class="p-4 bg-white rounded-lg shadow">
            <NuxtLink
              :to="`/post/${post.slug}`"
              class="text-xl font-semibold text-blue-600 hover:underline"
            >
              {{ post.title }}
            </NuxtLink>
            <p v-if="post.excerpt" class="text-gray-600 mt-2">{{ post.excerpt }}</p>
            <p class="text-sm text-gray-400 mt-2">
              {{ formatDate(post.created_at) }}
            </p>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  created_at: string;
}

const { t, locale } = useI18n();

const { posts } = await useFetch<Post[]>("/api/posts", {
  baseURL: process.env.API_URL || "http://localhost:8788",
});

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(locale.value === "zh-CN" ? "zh-CN" : "en");
}
</script>
