/**
 * @cf-blog/i18n - 出口文件
 *
 * 基于 i18next 的多框架国际化方案
 */

// 重新导出 i18next 类型
export type { i18n as i18nType } from 'i18next';
// 核心配置
export { default, i18n } from './i18n';
export type { Locale, TranslationKey, Translations } from './translations';
// 翻译数据和类型
export { defaultLocale, supportedLocales, translations } from './translations';
