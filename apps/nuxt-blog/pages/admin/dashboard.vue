<template>
  <div class="min-h-screen bg-gray-100">
    <main class="max-w-7xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t("admin.dashboard") }}</h1>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="stat in statCards" :key="stat.title" class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-500">{{ stat.title }}</p>
              <p class="mt-1 text-3xl font-semibold text-gray-900">{{ stat.value }}</p>
              <p class="mt-1 text-sm text-gray-400">{{ stat.sub }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t("admin.quickActions") }}</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            to="/admin/posts/new"
            class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <h3 class="font-medium text-gray-900">{{ t("post.new") }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ t("admin.quickActions.newPost") }}</p>
          </NuxtLink>
          <NuxtLink
            to="/admin/comments"
            class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <h3 class="font-medium text-gray-900">{{ t("admin.approveComments") }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ t("admin.quickActions.approveComments") }}</p>
          </NuxtLink>
          <NuxtLink
            to="/admin/users"
            class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <h3 class="font-medium text-gray-900">{{ t("admin.userManagement") }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ t("admin.quickActions.userManagement") }}</p>
          </NuxtLink>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t("admin.recentActivity") }}</h2>
        <div class="bg-white rounded-lg shadow">
          <div class="divide-y divide-gray-200">
            <div v-for="i in 5" :key="i" class="px-6 py-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ t("admin.activity.newPost") }}</p>
                <p class="text-sm text-gray-500">{{ t("admin.activity.time", { hours: i }) }}</p>
              </div>
              <span class="text-sm text-blue-600">{{ t("common.view") }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" });

const { t } = useI18n();

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

const stats = ref<Stats | null>(null);
const loading = ref(true);

const statCards = computed(() => {
  const s = stats.value;
  if (!s) return [];
  return [
    {
      title: t("stats.totalPosts"),
      value: s.totalPosts,
      sub: `${s.publishedPosts} ${t("post.status.published")} · ${s.draftPosts} ${t("post.status.draft")}`,
      color: "blue",
    },
    {
      title: t("stats.totalComments"),
      value: s.totalComments,
      sub: `${s.pendingComments} ${t("comment.pending")}`,
      color: "green",
    },
    {
      title: t("stats.totalUsers"),
      value: s.totalUsers,
      sub: `${s.pendingUsers} ${t("user.pending")}`,
      color: "purple",
    },
    {
      title: t("stats.totalViews"),
      value: s.totalViews,
      sub: t("stats.totalViews.sub"),
      color: "orange",
    },
  ];
});

onMounted(async () => {
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();
    if (data.success && data.data) {
      stats.value = data.data;
    }
  } catch (err) {
    console.error("Failed to fetch stats:", err);
  } finally {
    loading.value = false;
  }
});
</script>
