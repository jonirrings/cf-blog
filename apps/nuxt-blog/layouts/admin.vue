<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed w-64 h-screen bg-white shadow-lg flex flex-col">
      <!-- Logo / Title -->
      <div class="px-6 py-4 border-b border-gray-200">
        <NuxtLink to="/admin/dashboard" class="text-xl font-bold text-gray-900">
          {{ t("admin.title") }}
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="
            isActive(item.to) ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
          "
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Language Switcher -->
      <div class="px-4 py-3 border-t border-gray-200">
        <select
          :value="locale"
          @change="handleLocaleChange(($event.target as HTMLSelectElement).value as Locale)"
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option v-for="loc in supportedLocales" :key="loc.code" :value="loc.code">
            {{ loc.flag }} {{ loc.name }}
          </option>
        </select>
      </div>

      <!-- User Info -->
      <div v-if="userInfo" class="px-4 py-3 border-t border-gray-200">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
          >
            {{ userInfo.name?.charAt(0)?.toUpperCase() || "?" }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userInfo.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userInfo.email }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="mt-2 w-full text-left text-sm text-red-600 hover:text-red-800"
        >
          {{ t("nav.logout") }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 flex-1">
      <div class="p-6">
        <!-- Back to blog link -->
        <div class="mb-4">
          <NuxtLink to="/" class="text-sm text-blue-600 hover:underline">
            {{ t("admin.backToBlog") }}
          </NuxtLink>
        </div>
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Locale } from '@cf-blog/i18n';

// biome-ignore lint/correctness/noUnusedVariables: used in template
const { t, locale, setLocale, supportedLocales } = useI18n();
const route = useRoute();

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

const userInfo = ref<UserInfo | null>(null);

// biome-ignore lint/correctness/noUnusedVariables: used in template
const navItems = computed(() => [
  { to: '/admin/dashboard', icon: '📊', label: t('admin.dashboard') },
  { to: '/admin/posts', icon: '📝', label: t('admin.posts') },
  { to: '/admin/comments', icon: '💬', label: t('admin.comments') },
  { to: '/admin/users', icon: '👥', label: t('admin.users') },
  { to: '/admin/settings', icon: '⚙️', label: t('admin.settings') },
]);

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(`${path}/`);
}

async function handleLocaleChange(newLocale: Locale) {
  await setLocale(newLocale);
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore logout API errors
  }
  navigateTo('/auth/login');
}

onMounted(async () => {
  try {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    if (!res.ok || !data.success || !data.user) {
      navigateTo('/auth/login');
      return;
    }
    if (data.user.role !== 'admin') {
      navigateTo('/');
      return;
    }
    userInfo.value = {
      name: data.user.name || '',
      email: data.user.email || '',
      role: data.user.role,
    };
  } catch {
    navigateTo('/auth/login');
  }
});
</script>
