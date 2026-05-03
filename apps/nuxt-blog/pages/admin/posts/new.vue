<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="mb-6 p-4 bg-white shadow">
      <NuxtLink to="/admin/posts" class="text-blue-600 hover:underline">
        ← {{ t("admin.back") }}
      </NuxtLink>
    </nav>

    <main class="max-w-4xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t("post.new") }}</h1>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{
              t("post.title")
            }}</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              :placeholder="t('post.title')"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t("post.slug") }}</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="article-slug"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{
              t("post.excerpt")
            }}</label>
            <textarea
              v-model="form.excerpt"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              :placeholder="t('post.excerpt')"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{
                t("post.framework")
              }}</label>
              <select
                v-model="form.framework"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="next">{{ t("framework.next") }}</option>
                <option value="nuxt">{{ t("framework.nuxt") }}</option>
                <option value="svelte">{{ t("framework.svelte") }}</option>
                <option value="astro">{{ t("framework.astro") }}</option>
                <option value="solid">{{ t("framework.solid") }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{
                t("post.status")
              }}</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">{{ t("post.status.draft") }}</option>
                <option value="published">{{ t("post.status.published") }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">{{
            t("post.content")
          }}</label>
          <RichTextEditor
            :placeholder="t('post.contentPlaceholder')"
            @content-change="handleContentChange"
          />
          <p class="text-xs text-gray-500 mt-1">{{ t("post.editorTip") }}</p>
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? t("common.loading") : t("common.save") }}
          </button>
          <NuxtLink
            to="/admin/posts"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
          >
            {{ t("common.cancel") }}
          </NuxtLink>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });

const { t } = useI18n();

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

const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  framework: 'nuxt',
  status: 'draft',
});

const saving = ref(false);

function handleContentChange(content: JSONContent) {
  form.value.content = JSON.stringify(content);
}

const handleSubmit = async () => {
  saving.value = true;
  try {
    await $fetch('/api/posts', {
      method: 'POST',
      body: form.value,
    });
    navigateTo('/admin/posts');
  } catch (error) {
    alert(t('form.error') + ': ' + error.message);
  } finally {
    saving.value = false;
  }
};
</script>
