/**
 * SolidStart i18n 工具
 *
 * 使用 @cf-blog/i18n 集成
 */

import { createSignal, onMount } from "solid-js";
import i18n, { supportedLocales, type Locale } from "@cf-blog/i18n";

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
  const [locale, setLocaleState] = createSignal<Locale>("zh-CN");
  const [ready, setReady] = createSignal(false);

  onMount(() => {
    const savedLocale = document.cookie.match(/locale=([^;]+)/)?.[1] as Locale | null;
    if (savedLocale && ["zh-CN", "en"].includes(savedLocale)) {
      i18n.changeLanguage(savedLocale);
      setLocaleState(savedLocale);
    }
    setReady(true);
  });

  const changeLocale = async (newLocale: Locale) => {
    await i18n.changeLanguage(newLocale);
    setLocaleState(newLocale);
    document.cookie = `locale=${newLocale}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
  };

  return {
    t: i18n.t.bind(i18n),
    i18n,
    locale,
    changeLocale,
    ready,
  };
}

export { i18n, supportedLocales };
export type { Locale } from "@cf-blog/i18n";
