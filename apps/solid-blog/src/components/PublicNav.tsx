import { type Locale, supportedLocales } from '@cf-blog/i18n';
import { A } from '@solidjs/router';
import { useTranslation } from '~/lib/i18n';

const frameworks = [
  { href: '/next/', labelKey: 'framework.next', color: 'text-blue-600' },
  { href: '/nuxt/', labelKey: 'framework.nuxt', color: 'text-green-600' },
  { href: '/svelte/', labelKey: 'framework.svelte', color: 'text-orange-600' },
  { href: '/astro/', labelKey: 'framework.astro', color: 'text-purple-600' },
  { href: '/solid/', labelKey: 'framework.solid', color: 'text-blue-500' },
] as const;

export function PublicNav() {
  const { t, locale, changeLocale } = useTranslation();

  function handleLocaleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    changeLocale(select.value as Locale);
  }

  return (
    <>
      <header class="bg-white shadow">
        <div class="max-w-4xl mx-auto px-4 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                <A href="/solid/" class="hover:text-blue-600">
                  Solid Blog
                </A>
              </h1>
              <p class="text-gray-600 mt-1">{t('site.poweredBy')}</p>
            </div>
            <div class="flex items-center gap-4">
              <select
                value={locale()}
                onChange={handleLocaleChange}
                class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select language"
              >
                {supportedLocales.map((loc) => (
                  <option value={loc.code}>
                    {loc.flag} {loc.name}
                  </option>
                ))}
              </select>
              <A href="/auth/login" class="text-sm text-gray-600 hover:text-gray-900">
                {t('auth.login')}
              </A>
            </div>
          </div>
        </div>
      </header>

      <nav class="bg-gray-100 border-b">
        <div class="max-w-4xl mx-auto px-4 py-3">
          <span class="font-semibold mr-3 text-sm">{t('site.frameworkSwitch')}</span>
          {frameworks.map((fw) => (
            <A href={fw.href} class={`${fw.color} hover:underline text-sm mr-3`}>
              {t(fw.labelKey)}
            </A>
          ))}
        </div>
      </nav>
    </>
  );
}
