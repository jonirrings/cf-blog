<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t("comment.management") }}</h1>

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

    <!-- 评论列表 -->
    <div class="space-y-4">
      <div v-if="loading" class="text-center text-gray-500 py-8">{{ t("common.loading") }}</div>
      <div v-else-if="filteredComments.length === 0" class="text-center text-gray-500 py-8">
        {{ t("comment.noComments") }}
      </div>
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <span class="text-sm font-medium text-gray-900">{{ comment.userName }}</span>
            <span class="mx-2 text-gray-300">|</span>
            <span class="text-sm text-gray-500">
              {{ t("comment.commentedOn") }}
              <NuxtLink :to="`/post/${comment.postId}`" class="text-blue-600 hover:underline">
                {{ comment.postTitle }}
              </NuxtLink>
            </span>
          </div>
          <div class="flex gap-2">
            <span
              v-if="comment.rejected"
              class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
            >
              {{ t("comment.status.rejected") }}
            </span>
            <span
              v-else-if="comment.userApproved && comment.postApproved"
              class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
            >
              {{ t("comment.status.approved") }}
            </span>
            <span
              v-else
              class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"
            >
              {{ t("comment.status.pending") }}
            </span>
          </div>
        </div>

        <p class="text-gray-700 mb-4">{{ comment.content }}</p>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-400">
            {{ new Date(comment.createdAt).toLocaleString(locale === "zh-CN" ? "zh-CN" : "en") }}
          </span>

          <div
            v-if="!comment.rejected && (!comment.userApproved || !comment.postApproved)"
            class="flex gap-2"
          >
            <button
              @click="handleApprove(comment.id)"
              class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              {{ t("common.approve") }}
            </button>
            <button
              @click="handleReject(comment.id)"
              class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              {{ t("common.reject") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });

// biome-ignore lint/correctness/noUnusedVariables: used in template
const { t, locale } = useI18n();

interface Comment {
  id: number;
  postId: number;
  postTitle: string;
  userId: number;
  userName: string;
  content: string;
  userApproved: boolean;
  postApproved: boolean;
  rejected: boolean;
  createdAt: string;
}

interface FilterOption {
  value: 'all' | 'pending' | 'approved' | 'rejected';
  label: string;
  count: number;
  activeClass: string;
}

const filters = ref<FilterOption[]>([
  {
    value: 'pending',
    label: t('comment.status.pending'),
    count: 0,
    activeClass: 'bg-yellow-100 text-yellow-600',
  },
  {
    value: 'approved',
    label: t('comment.status.approved'),
    count: 0,
    activeClass: 'bg-green-100 text-green-600',
  },
  {
    value: 'rejected',
    label: t('comment.status.rejected'),
    count: 0,
    activeClass: 'bg-red-100 text-red-600',
  },
]);

// biome-ignore lint/correctness/noUnusedVariables: used in template
const currentFilter = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending');
// biome-ignore lint/correctness/noUnusedVariables: used in template
const comments = ref<Comment[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: used in template
const loading = ref(true);

// biome-ignore lint/correctness/noUnusedVariables: used in template
const filteredComments = computed(() => {
  if (currentFilter.value === 'all') return comments.value;
  if (currentFilter.value === 'pending')
    return comments.value.filter((c) => !c.userApproved || !c.postApproved);
  if (currentFilter.value === 'approved')
    return comments.value.filter((c) => c.userApproved && c.postApproved);
  if (currentFilter.value === 'rejected') return comments.value.filter((c) => c.rejected);
  return comments.value;
});

const updateFilterCounts = () => {
  filters.value[0].count = comments.value.filter((c) => !c.userApproved || !c.postApproved).length;
  filters.value[1].count = comments.value.filter((c) => c.userApproved && c.postApproved).length;
  filters.value[2].count = comments.value.filter((c) => c.rejected).length;
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleApprove = async (id: number) => {
  try {
    const res = await $fetch(`/api/comments/${id}/approve`, {
      method: 'POST',
      body: { approveType: 'user' },
    });
    if (res.success) {
      comments.value = comments.value.map((c) => (c.id === id ? { ...c, userApproved: true } : c));
      updateFilterCounts();
    }
  } catch (err) {
    console.error('Approve failed:', err);
    alert(t('comment.approveFailed'));
  }
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleReject = async (id: number) => {
  const reason = prompt(t('comment.rejectReason'));
  if (!reason) return;

  try {
    const res = await $fetch(`/api/comments/${id}/reject`, {
      method: 'POST',
      body: { reason },
    });
    if (res.success) {
      comments.value = comments.value.map((c) =>
        c.id === id ? { ...c, rejected: true, rejectReason: reason } : c
      );
      updateFilterCounts();
    }
  } catch (err) {
    console.error('Reject failed:', err);
    alert(t('comment.rejectFailed'));
  }
};

onMounted(async () => {
  try {
    const res = await $fetch('/api/comments');
    comments.value = res.data?.list || [];
    updateFilterCounts();
  } catch (err) {
    console.error('Failed to fetch comments:', err);
  } finally {
    loading.value = false;
  }
});
</script>
