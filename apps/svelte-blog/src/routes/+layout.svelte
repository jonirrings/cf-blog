<script lang="ts">
import '../app.css';
import { onMount } from 'svelte';
import { t, locale, initLocale, setLocaleWithCookie, supportedLocales } from '$lib/i18n';
import type { Locale } from '@cf-blog/i18n';

let currentLocale = $state<string>('zh-CN');

onMount(() => {
  initLocale();

  locale.subscribe((val) => {
    currentLocale = val;
  });
});

function handleLocaleChange(e: Event) {
  const select = e.target as HTMLSelectElement;

  setLocaleWithCookie(select.value as Locale);
}
</script>

<main class="min-h-screen p-8">
	<div class="max-w-4xl mx-auto">
		<header class="mb-8">
			<div class="flex items-center justify-between mb-4">
				<h1 class="text-4xl font-bold">SvelteKit Blog</h1>

				<div class="flex items-center gap-4">
					<select
						value={currentLocale}
						onchange={handleLocaleChange}
						class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
						aria-label="Select language"
					>
						{#each supportedLocales as loc}
							<option value={loc.code}>{loc.flag} {loc.name}</option>
						{/each}
					</select>

					<a
						href="/auth/login"
						class="text-sm text-gray-600 hover:text-gray-900"
					>{t('auth.login')}</a>
				</div>
			</div>

			<nav
				class="flex items-center gap-4 p-4 bg-gray-100 rounded-lg"
			>
				<span class="font-semibold mr-2">{t('site.frameworkSwitch')}</span>

				<a
					href="/next/"
					class="text-blue-600 hover:underline text-sm"
				>{t('framework.next')}</a>

				<a
					href="/nuxt/"
					class="text-green-600 hover:underline text-sm"
				>{t('framework.nuxt')}</a>

				<a
					href="/svelte/"
					class="text-orange-600 hover:underline text-sm"
				>{t('framework.svelte')}</a>

				<a
					href="/astro/"
					class="text-purple-600 hover:underline text-sm"
				>{t('framework.astro')}</a>

				<a
					href="/solid/"
					class="text-blue-500 hover:underline text-sm"
				>{t('framework.solid')}</a>
			</nav>
		</header>

		<slot></slot>
	</div>
</main>
