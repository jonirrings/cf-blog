<script lang="ts">
import { t } from '$lib/i18n';
import { onMount } from 'svelte';

interface SiteConfig {
  title: string;
  description: string;
  logo: string;
  footerText: string;
  enableComments: boolean;
  enableAnalytics: boolean;
}

let config: SiteConfig = {
  title: '',
  description: '',
  logo: '',
  footerText: '',
  enableComments: true,
  enableAnalytics: true,
};

let loading = $state(false);
let saved = $state(false);

const handleSubmit = async () => {
  loading = true;
  saved = false;

  try {
    const res = await fetch('/api/config/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      saved = true;
      setTimeout(() => (saved = false), 3000);
    }
  } catch (err) {
    console.error('Save failed:', err);
    alert(t('settings.error'));
  } finally {
    loading = false;
  }
};

onMount(async () => {
  try {
    const res = await fetch('/api/config/site');
    const data = await res.json();
    if (data.data) {
      config = { ...config, ...data.data };
    }
  } catch (err) {
    console.error('Failed to fetch config:', err);
  }
});
</script>

<div>
  <h1 class="text-2xl font-bold text-gray-900 mb-6">{t('admin.settings')}</h1>

  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    {#if saved}
      <div class="bg-green-50 text-green-700 p-4 rounded-lg">
        {t('settings.saved')}
      </div>
    {/if}

    <!-- Basic info -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{t('settings.basicInfo')}</h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.siteTitle')}
          </label>
          <input
            type="text"
            bind:value={config.title}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.siteDesc')}
          </label>
          <textarea
            bind:value={config.description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.logoUrl')}
          </label>
          <input
            type="url"
            bind:value={config.logo}
            placeholder="https://example.com/logo.png"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {t('settings.footerText')}
          </label>
          <input
            type="text"
            bind:value={config.footerText}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Feature toggles -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{t('settings.featureToggles')}</h2>

      <div class="space-y-4">
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">{t('settings.enableComments')}</span>
          <input
            type="checkbox"
            bind:checked={config.enableComments}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>

        <label class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">{t('settings.enableAnalytics')}</span>
          <input
            type="checkbox"
            bind:checked={config.enableAnalytics}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>
      </div>
    </div>

    <!-- Save button -->
    <div class="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('common.loading') : t('common.save')}
      </button>
    </div>
  </form>
</div>
