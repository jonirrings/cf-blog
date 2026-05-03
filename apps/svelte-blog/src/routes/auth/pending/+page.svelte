<script lang="ts">
import { onMount } from 'svelte';
import { t } from '$lib/i18n';
import { goto } from '$app/navigation';

interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
}

let session: SessionUser | null = null;
let loading = $state(true);

onMount(async () => {
  try {
    const res = await fetch('/api/auth/session');
    const data = await res.json();

    if (!data.success || !data.session) {
      goto('/svelte/auth/login');
      return;
    }

    session = data.session;

    if (data.session.isApproved) {
      goto('/svelte/admin');
    }
  } catch {
    goto('/svelte/auth/login');
    return;
  } finally {
    loading = false;
  }
});
</script>

<main class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
    {#if loading}
      <p class="text-gray-500">{t('common.loading')}</p>
    {:else}
      <div class="mb-6">
        <div class="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <span class="text-3xl">&#9203;</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{t('auth.pendingTitle')}</h1>
        <p class="text-gray-600">{t('auth.pendingMessage')}</p>
      </div>

      {#if session}
        <div class="mb-6 p-4 bg-gray-50 rounded-md">
          <p class="text-sm text-gray-500">{t('auth.pendingEmail')}</p>
          <p class="text-gray-900 font-medium">{session.email}</p>
        </div>
      {/if}

      <div class="mb-6">
        <p class="text-sm text-gray-600 text-left">{t('auth.approvalProcess')}</p>
        <ul class="text-sm text-gray-500 text-left mt-2 space-y-1 list-disc list-inside">
          <li>{t('auth.approvalStep1')}</li>
          <li>{t('auth.approvalStep2')}</li>
          <li>{t('auth.approvalStep3')}</li>
        </ul>
      </div>

      <a
        href="/svelte/auth/login"
        class="inline-block text-blue-600 hover:underline"
      >
        {t('auth.backToLogin')}
      </a>
    {/if}
  </div>
</main>
