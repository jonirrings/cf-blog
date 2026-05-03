<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full">
      <div class="bg-white py-8 px-6 rounded-lg shadow-lg text-center">
        <div
          class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4"
        >
          <svg
            class="h-8 w-8 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t("auth.pendingTitle") }}</h1>
        <p class="text-gray-600 mb-6">{{ t("auth.pendingMessage") }}</p>

        <div v-if="sessionEmail" class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-500">{{ t("auth.pendingEmail") }}</p>
          <p class="text-sm font-medium text-gray-900">{{ sessionEmail }}</p>
        </div>

        <div class="text-left bg-blue-50 rounded-lg p-4 mb-6">
          <p class="text-sm font-medium text-blue-800 mb-2">{{ t("auth.approvalProcess") }}</p>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>1. {{ t("auth.approvalStep1") }}</li>
            <li>2. {{ t("auth.approvalStep2") }}</li>
            <li>3. {{ t("auth.approvalStep3") }}</li>
          </ul>
        </div>

        <NuxtLink
          to="/auth/login"
          class="inline-block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 text-center"
        >
          {{ t("auth.backToLogin") }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const sessionEmail = ref("");

onMounted(async () => {
  try {
    const res = await fetch("/api/auth/session");
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      sessionEmail.value = data.user.email || "";
    }
  } catch {
    // Session fetch failed, show page without email
  }
});
</script>
