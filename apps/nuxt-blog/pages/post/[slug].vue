<template>
  <article v-if="post">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">{{ post.title }}</h1>
      <div class="text-sm text-gray-500 space-x-4">
        <span>{{ t("site.publishedAt") }} {{ formatDate(post.created_at) }}</span>
        <span v-if="post.updated_at !== post.created_at">
          {{ t("site.updatedAt") }} {{ formatDate(post.updated_at) }}
        </span>
      </div>
    </header>

    <div v-if="post.excerpt" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <p class="text-gray-700 italic">{{ post.excerpt }}</p>
    </div>

    <div class="prose prose-lg max-w-none" v-html="post.content" />
  </article>
  <div v-else class="text-center">
    <p class="text-gray-500">{{ t("site.postNotExist") }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  created_at: string;
  updated_at: string;
}

const { t, locale } = useI18n();

const route = useRoute();
const { post } = await useFetch<Post>(`/api/posts/${route.params.slug}`, {
  baseURL: process.env.API_URL || 'http://localhost:8788',
});

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(locale.value === 'zh-CN' ? 'zh-CN' : 'en');
}
</script>
