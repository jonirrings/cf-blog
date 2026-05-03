<script lang="ts">
  import { t } from '$lib/i18n';
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.user?.isApproved) {
          goto('/svelte/admin');
        } else {
          goto('/svelte/auth/pending');
        }
      } else {
        error = data.message || t('auth.loginFailed');
      }
    } catch {
      error = t('auth.networkError');
    } finally {
      loading = false;
    }
  }

  function handleGitHubLogin() {
    // GitHub OAuth placeholder
    window.location.href = '/api/auth/github';
  }

  function handlePasskeyLogin() {
    // Passkey/WebAuthn placeholder
    alert(t('auth.passkeyUnsupported'));
  }
</script>

<main class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-gray-900 text-center mb-2">{t('auth.loginTitle')}</h1>
    <p class="text-gray-500 text-center mb-6">{t('auth.loginSubtitle')}</p>

    {#if error}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
        {error}
      </div>
    {/if}

    <form on:submit={handleSubmit} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.email')}
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.password')}
        </label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('auth.loggingIn') : t('auth.login')}
      </button>
    </form>

    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">{t('auth.or')}</span>
        </div>
      </div>

      <div class="mt-4 space-y-3">
        <button
          type="button"
          onclick={handleGitHubLogin}
          class="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50"
        >
          {t('auth.github')}
        </button>

        <button
          type="button"
          onclick={handlePasskeyLogin}
          class="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50"
        >
          {t('auth.passkey')}
        </button>
      </div>
    </div>

    <p class="mt-6 text-center text-sm text-gray-600">
      {t('auth.noAccount')}
      <a href="/svelte/auth/register" class="text-blue-600 hover:underline">{t('auth.register')}</a>
    </p>
  </div>
</main>
