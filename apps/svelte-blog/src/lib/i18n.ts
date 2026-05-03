/**
 * SvelteKit i18n Store
 *
 * 使用 @cf-blog/i18n 集成
 */

import { writable } from 'svelte/store';
import i18n, { supportedLocales, type Locale } from '@cf-blog/i18n';

// 当前语言 store
export const locale = writable<Locale>('zh-CN');
export const ready = writable(false);

// 初始化语言
export function initLocale() {
  const savedLocale = document.cookie.match(/locale=([^;]+)/)?.[1] as Locale | null;
  if (savedLocale && ['zh-CN', 'en'].includes(savedLocale)) {
    i18n.changeLanguage(savedLocale);
    locale.set(savedLocale);
  }
  ready.set(true);
}

// 获取翻译
export function t(key: string) {
  return i18n.t(key);
}

// 设置语言
export async function setLocaleWithCookie(newLocale: Locale) {
  await i18n.changeLanguage(newLocale);
  locale.set(newLocale);
  document.cookie = `locale=${newLocale}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
}

export { i18n, supportedLocales };
