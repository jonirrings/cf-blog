/**
 * @cf-blog/i18n - 出口文件
 *
 * 基于 i18next 的多框架国际化方案
 */

// 核心配置
export { i18n, default } from './i18n';

// 翻译数据和类型
export { translations, supportedLocales, defaultLocale } from './translations';
export type { Locale, TranslationKey, Translations } from './translations';

// 重新导出 i18next 类型
export type { i18n as i18nType } from 'i18next';
