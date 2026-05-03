/**
 * Next.js i18n 配置
 *
 * 使用 react-i18next 集成
 */

'use client';

import i18n from '@cf-blog/i18n';
import type { Locale } from '@cf-blog/i18n';
import { useEffect, useState } from 'react';

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
    const savedLocale = getCookie('locale') as Locale | null;
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
export { i18n };
