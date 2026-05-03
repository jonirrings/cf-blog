<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ t("post.management") }}</h1>
      <NuxtLink
        to="/admin/posts/new"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        {{ t("post.new") }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="mb-4 flex gap-2">
      <button
        v-for="option in filters"
        :key="option.value"
        @click="currentFilter = option.value"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium',
          currentFilter === option.value
            ? option.activeClass
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        ]"
      >
        {{ option.label }} ({{ option.count }})
      </button>
    </div>

    <!-- Post table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {{ t("post.title") }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {{ t("post.framework") }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {{ t("post.status") }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {{ t("post.viewCount") }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              {{ t("common.actions") }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
              {{ t("common.loading") }}
            </td>
          </tr>
          <tr v-else-if="filteredPosts.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">{{ t("post.noPosts") }}</td>
          </tr>
          <tr v-for="post in filteredPosts" :key="post.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
              <div class="text-sm text-gray-500">/{{ post.slug }}</div>
            </td>
            <td class="px-6 py-4">
              <span :class="frameworkClass(post.framework)">{{
                t(`framework.${post.framework}`)
              }}</span>
            </td>
            <td class="px-6 py-4">
              <span :class="statusClass(post.status)">{{ t(`post.status.${post.status}`) }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ post.viewCount }}</td>
            <td class="px-6 py-4 text-right space-x-3">
              <NuxtLink :to="`/post/${post.slug}`" class="text-blue-600 hover:underline">{{
                t("common.view")
              }}</NuxtLink>
              <button @click="deletePost(post.id)" class="text-red-600 hover:underline">
                {{ t("common.delete") }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" });

const { t } = useI18n();

interface Post {
  id: number;
  title: string;
  slug: string;
  framework: "next" | "nuxt" | "svelte" | "astro" | "solid";
  status: "draft" | "published";
  viewCount: number;
}

interface FilterOption {
  value: "all" | "published" | "draft";
  label: string;
  count: number;
  activeClass: string;
}

const filters = ref<FilterOption[]>([
  { value: "all", label: t("filter.all"), count: 0, activeClass: "bg-blue-100 text-blue-600" },
  {
    value: "published",
    label: t("post.status.published"),
    count: 0,
    activeClass: "bg-green-100 text-green-600",
  },
  {
    value: "draft",
    label: t("post.status.draft"),
    count: 0,
    activeClass: "bg-yellow-100 text-yellow-600",
  },
]);

const currentFilter = ref<"all" | "published" | "draft">("all");
const posts = ref<Post[]>([]);
const loading = ref(true);

const filteredPosts = computed(() => {
  if (currentFilter.value === "all") return posts.value;
  return posts.value.filter((p) => p.status === currentFilter.value);
});

const frameworkClass = (framework: string) => {
  const classes: Record<string, string> = {
    next: "px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800",
    nuxt: "px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800",
    svelte: "px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800",
    astro: "px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800",
    solid: "px-2 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800",
  };
  return (
    classes[framework] || "px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
  );
};

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    published: "px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800",
    draft: "px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800",
  };
  return (
    classes[status] || "px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
  );
};

const deletePost = async (id: number) => {
  if (!confirm(t("post.deleteConfirm"))) return;
  try {
    await $fetch(`/api/posts/${id}`, { method: "DELETE" });
    posts.value = posts.value.filter((p) => p.id !== id);
  } catch (err) {
    alert(t("form.error"));
  }
};

const updateFilterCounts = () => {
  filters.value[0].count = posts.value.length;
  filters.value[1].count = posts.value.filter((p) => p.status === "published").length;
  filters.value[2].count = posts.value.filter((p) => p.status === "draft").length;
};

onMounted(async () => {
  try {
    const res = await $fetch("/api/posts");
    posts.value = res.data?.list || [];
    updateFilterCounts();
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    // Fallback to sample data
    posts.value = [
      {
        id: 1,
        title: t("post.sample1.title"),
        slug: "welcome-to-cf-blog",
        framework: "next",
        status: "published",
        viewCount: 100,
      },
      {
        id: 2,
        title: t("post.sample2.title"),
        slug: "nextjs-ssg-guide",
        framework: "next",
        status: "published",
        viewCount: 50,
      },
    ];
    updateFilterCounts();
  } finally {
    loading.value = false;
  }
});
</script>
