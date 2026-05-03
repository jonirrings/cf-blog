/**
 * Next.js i18n 配置
 *
 * 使用 react-i18next 集成
 */

'use client';

import { useEffect, useState } from 'react';
import i18n, { supportedLocales, type Locale } from '@cf-blog/i18n';

/**
 * React Hook - 获取当前语言和翻译
 *
 * @example
 * ```tsx
 * const { t, i18n } = useTranslation();
 * return <h1>{t('nav.home')}</h1>;
 * ```
 */
export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>((i18n.language as Locale) || 'zh-CN');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 初始化语言
    const savedLocale = document.cookie.match(/locale=([^;]+)/)?.[1] as Locale | null;
    if (savedLocale && ['zh-CN', 'en'].includes(savedLocale)) {
      i18n.changeLanguage(savedLocale);
      setLocaleState(savedLocale);
    }
    setReady(true);
  }, []);

  const changeLocale = async (newLocale: Locale) => {
    await i18n.changeLanguage(newLocale);
    setLocaleState(newLocale);
    // 保存到 Cookie
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

export { i18n };
export type { Locale } from '@cf-blog/i18n';
