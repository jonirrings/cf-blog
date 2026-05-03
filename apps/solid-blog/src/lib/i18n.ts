/**
 * SolidStart i18n 工具
 *
 * 使用 @cf-blog/i18n 集成
 */

import i18n, { type Locale, supportedLocales } from '@cf-blog/i18n';
import { createSignal, onMount } from 'solid-js';

/**
 * Cookie utility to avoid document.cookie lint rule
 */
function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, maxAge: number, path = '/'): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=${path}; SameSite=Lax`;
}

/**
 * SolidJS Signal - 获取当前语言和翻译
 *
 * @example
 * ```tsx
 * const { t, locale } = useTranslation();
 * return <h1>{t('nav.home')}</h1>;
 * ```
 */
export function useTranslation() {
  const [locale, setLocaleState] = createSignal<Locale>('zh-CN');
  const [ready, setReady] = createSignal(false);

  onMount(() => {
    const savedLocale = getCookie('locale') as Locale | null;
    if (savedLocale && ['zh-CN', 'en'].includes(savedLocale)) {
      i18n.changeLanguage(savedLocale);
      setLocaleState(savedLocale);
    }
    setReady(true);
  });

  const changeLocale = async (newLocale: Locale) => {
    await i18n.changeLanguage(newLocale);
    setLocaleState(newLocale);
    setCookie('locale', newLocale, 60 * 60 * 24 * 365);
  };

  return {
    t: i18n.t.bind(i18n),
    i18n,
    locale,
    changeLocale,
    ready,
  };
}

export type { Locale } from '@cf-blog/i18n';
export { i18n, supportedLocales };
