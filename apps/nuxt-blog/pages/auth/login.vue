<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">{{ t("auth.loginTitle") }}</h1>
        <p class="mt-2 text-sm text-gray-600">{{ t("auth.loginSubtitle") }}</p>
      </div>
      <div class="bg-white py-8 px-6 rounded-lg shadow-lg">
        <!-- GitHub button -->
        <button
          @click="handleGitHub"
          :disabled="githubLoading"
          class="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-3"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          {{ githubLoading ? t("auth.githubRedirecting") : t("auth.github") }}
        </button>
        <!-- Passkey button -->
        <button
          @click="handlePasskey"
          :disabled="passkeyLoading"
          class="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-3"
        >
          {{ passkeyLoading ? t("auth.passkeyProcessing") : t("auth.passkey") }}
        </button>
        <!-- Divider -->
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">{{ t("auth.or") }}</span>
          </div>
        </div>
        <!-- Error -->
        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{{ error }}</div>
        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
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
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? t("auth.loggingIn") : t("auth.login") }}
          </button>
        </form>
        <div class="text-center mt-4">
          <NuxtLink to="/auth/register" class="text-sm text-blue-600"
            >{{ t("auth.noAccount") }} {{ t("auth.register") }}</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const githubLoading = ref(false);
const passkeyLoading = ref(false);

async function handleSubmit() {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.user.isApproved) {
        navigateTo("/admin/dashboard");
      } else {
        navigateTo("/auth/pending");
      }
    } else {
      error.value = data.error || t("auth.loginFailed");
    }
  } catch {
    error.value = t("auth.networkError");
  } finally {
    loading.value = false;
  }
}

async function handleGitHub() {
  githubLoading.value = true;
  try {
    const res = await fetch("/api/auth/github");
    const { authUrl } = await res.json();
    if (authUrl) window.location.href = authUrl;
  } catch {
    error.value = t("auth.networkError");
  } finally {
    githubLoading.value = false;
  }
}

function handlePasskey() {
  alert(t("auth.passkeyUnsupported"));
}
</script>
