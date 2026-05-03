<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">{{ t("auth.registerTitle") }}</h1>
        <p class="mt-2 text-sm text-gray-600">{{ t("auth.registerSubtitle") }}</p>
      </div>
      <div class="bg-white py-8 px-6 rounded-lg shadow-lg">
        <!-- Error -->
        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{{ error }}</div>
        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("auth.nickname") }}</label>
            <input
              v-model="name"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("auth.email") }}</label>
            <input
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t("auth.password") }}</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">{{
              t("auth.passwordConfirm")
            }}</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? t("auth.registering") : t("auth.register") }}
          </button>
        </form>
        <div class="text-center mt-4">
          <NuxtLink to="/auth/login" class="text-sm text-blue-600"
            >{{ t("auth.hasAccount") }} {{ t("auth.login") }}</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");

async function handleSubmit() {
  error.value = "";

  if (password.value !== confirmPassword.value) {
    error.value = t("auth.passwordMismatch");
    return;
  }

  if (password.value.length < 6) {
    error.value = t("auth.passwordMinLength");
    return;
  }

  loading.value = true;
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      navigateTo("/auth/pending");
    } else {
      error.value = data.error || t("auth.registerFailed");
    }
  } catch {
    error.value = t("auth.networkError");
  } finally {
    loading.value = false;
  }
}
</script>
