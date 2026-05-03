<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t("admin.settings") }}</h1>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 保存提示 -->
      <div v-if="saved" class="bg-green-50 text-green-700 p-4 rounded-lg">
        {{ t("settings.saved") }}
      </div>

      <!-- 基本信息 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t("settings.basicInfo") }}</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("settings.siteTitle") }}
            </label>
            <input
              v-model="config.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("settings.siteDesc") }}
            </label>
            <textarea
              v-model="config.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("settings.logoUrl") }}
            </label>
            <input
              v-model="config.logo"
              type="url"
              placeholder="https://example.com/logo.png"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("settings.footerText") }}
            </label>
            <input
              v-model="config.footerText"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- 功能开关 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t("settings.featureToggles") }}</h2>

        <div class="space-y-4">
          <label class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">{{
              t("settings.enableComments")
            }}</span>
            <input
              v-model="config.enableComments"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          <label class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">{{
              t("settings.enableAnalytics")
            }}</span>
            <input
              v-model="config.enableAnalytics"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? t("settings.saving") : t("settings.saveConfig") }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" });

const { t } = useI18n();

interface SiteConfig {
  title: string;
  description: string;
  logo: string;
  footerText: string;
  enableComments: boolean;
  enableAnalytics: boolean;
}

const config = ref<SiteConfig>({
  title: "Nuxt Blog",
  description: "",
  logo: "",
  footerText: "© 2026 Cloudflare Blog. All rights reserved.",
  enableComments: true,
  enableAnalytics: true,
});

const loading = ref(false);
const saved = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  saved.value = false;

  try {
    const res = await $fetch("/api/config/site", {
      method: "PUT",
      body: config.value,
    });
    if (res.success) {
      saved.value = true;
      setTimeout(() => (saved.value = false), 3000);
    }
  } catch (err) {
    console.error("Save failed:", err);
    alert(t("form.error"));
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await $fetch("/api/config/site");
    if (res.data) {
      config.value = { ...config.value, ...res.data };
    }
  } catch (err) {
    console.error("Failed to fetch config:", err);
  }
});
</script>
