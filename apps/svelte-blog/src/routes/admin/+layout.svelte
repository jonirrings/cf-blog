<script lang="ts">
import { onMount } from 'svelte';
import { t, locale, setLocaleWithCookie, supportedLocales } from '$lib/i18n';

interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

let session: SessionUser | null = null;
let loading = $state(true);

onMount(async () => {
  try {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    if (data.success && data.session) {
      session = data.session;
      if (session.role !== 'admin') {
        window.location.href = '/svelte/';
        return;
      }
    } else {
      window.location.href = '/svelte/auth/login';
      return;
    }
  } catch {
    window.location.href = '/svelte/auth/login';
    return;
  } finally {
    loading = false;
  }
});

const navItems = [
  { href: '/svelte/admin', label: () => t('admin.dashboard'), icon: '📊' },
  { href: '/svelte/admin/posts', label: () => t('admin.posts'), icon: '📝' },
  { href: '/svelte/admin/comments', label: () => t('admin.comments'), icon: '💬' },
  { href: '/svelte/admin/users', label: () => t('admin.users'), icon: '👥' },
  { href: '/svelte/admin/settings', label: () => t('admin.settings'), icon: '⚙️' },
];
</script>

{#if loading}
  <div class="flex items-center justify-center min-h-screen">
    <p class="text-gray-500">{t('common.loading')}</p>
  </div>
{:else if session}
  <div class="flex min-h-screen bg-gray-100">
    <aside class="w-64 bg-white shadow-lg fixed h-full flex flex-col">
      <div class="p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">{t('admin.title')}</h2>
        <a href="/svelte/" class="text-sm text-blue-600 hover:underline">{t('admin.backToBlog')}</a>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        {#each navItems as item}
          <a href={item.href} class="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            {item.icon} {item.label()}
          </a>
        {/each}
      </nav>
      <div class="p-4 border-t">
        <select class="w-full px-3 py-2 border rounded-md text-sm" onchange={(e) => setLocaleWithCookie((e.target as HTMLSelectElement).value)}>
          {#each supportedLocales as loc}
            <option value={loc.code} selected={loc.code === $locale}>{loc.flag} {loc.name}</option>
          {/each}
        </select>
      </div>
      <div class="p-4 border-t">
        <p class="font-medium text-gray-900">{session.name}</p>
        <p class="text-sm text-gray-500">{t(`user.role.${session.role}`)}</p>
      </div>
    </aside>
    <main class="ml-64 flex-1 p-6">
      <slot />
    </main>
  </div>
{/if}
