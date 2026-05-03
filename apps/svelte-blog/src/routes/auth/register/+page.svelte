<script lang="ts">
import { t } from '$lib/i18n';
import { goto } from '$app/navigation';

let name = $state('');
let email = $state('');
let password = $state('');
let passwordConfirm = $state('');
let error = $state('');
let loading = $state(false);

function validate(): string | null {
  if (!name.trim()) return t('form.required');
  if (!email.trim()) return t('form.required');
  if (password.length < 6) return t('auth.passwordMinLength');
  if (password !== passwordConfirm) return t('auth.passwordMismatch');
  return null;
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  error = '';

  const validationError = validate();
  if (validationError) {
    error = validationError;
    return;
  }

  loading = true;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (data.success) {
      goto('/svelte/auth/pending');
    } else {
      error = data.message || t('auth.registerFailed');
    }
  } catch {
    error = t('auth.networkError');
  } finally {
    loading = false;
  }
}
</script>

<main class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-gray-900 text-center mb-2">{t('auth.registerTitle')}</h1>
    <p class="text-gray-500 text-center mb-6">{t('auth.registerSubtitle')}</p>

    {#if error}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
        {error}
      </div>
    {/if}

    <form on:submit={handleSubmit} class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.nickname')}
        </label>
        <input
          type="text"
          id="name"
          bind:value={name}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

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

      <div>
        <label for="passwordConfirm" class="block text-sm font-medium text-gray-700 mb-1">
          {t('auth.passwordConfirm')}
        </label>
        <input
          type="password"
          id="passwordConfirm"
          bind:value={passwordConfirm}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('auth.registering') : t('auth.register')}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      {t('auth.hasAccount')}
      <a href="/svelte/auth/login" class="text-blue-600 hover:underline">{t('auth.login')}</a>
    </p>
  </div>
</main>
