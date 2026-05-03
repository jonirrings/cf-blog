/**
 * i18next 配置
 *
 * 统一的国际化配置，支持所有 5 个框架
 */

import i18next from 'i18next';
import { translations } from './translations';

// 初始化配置
export const i18n = i18next.createInstance();

i18n.init({
  resources: {
    'zh-CN': {
      translation: translations['zh-CN'],
    },
    en: {
      translation: translations.en,
    },
  },
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
