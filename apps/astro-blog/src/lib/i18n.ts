/**
 * Astro i18n 工具
 *
 * 使用 @cf-blog/i18n 集成
 */

import i18n, { supportedLocales, type Locale } from "@cf-blog/i18n";

/**
 * 获取当前语言（服务端使用）
 */
export function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url);
  const urlLang = url.searchParams.get("lang") as Locale | null;
  if (urlLang && ["zh-CN", "en"].includes(urlLang)) {
    return urlLang;
  }

  // 从 Cookie 获取
  const cookie = request.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/(?:^|;\s*)locale=([^;]*)/);
    if (match) {
      const cookieLocale = decodeURIComponent(match[1]) as Locale;
      if (["zh-CN", "en"].includes(cookieLocale)) {
        return cookieLocale;
      }
    }
  }

  // 从 Accept-Language 获取
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage?.startsWith("zh")) {
    return "zh-CN";
  }
  if (acceptLanguage?.startsWith("en")) {
    return "en";
  }

  return "zh-CN";
}

/**
 * 获取翻译（服务端使用）
 */
export function getT(locale: Locale = "zh-CN") {
  return (key: string) => {
    return i18n.t(key, { lng: locale });
  };
}

export { i18n, supportedLocales };
export type { Locale } from "@cf-blog/i18n";
