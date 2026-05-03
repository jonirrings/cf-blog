/**
 * Nuxt i18n Composable
 *
 * 使用 @cf-blog/i18n 集成
 */

import i18n, { type Locale, supportedLocales } from '@cf-blog/i18n';

export const useI18n = () => {
  const locale = ref<Locale>('zh-CN');
  const ready = ref(false);

  // 初始化语言
  onMounted(() => {
    const savedLocale = useCookie('locale').value as Locale | null;
    if (savedLocale && ['zh-CN', 'en'].includes(savedLocale)) {
      i18n.changeLanguage(savedLocale);
      locale.value = savedLocale;
    }
    ready.value = true;
  });

  const t = i18n.t.bind(i18n);

  const setLocale = async (newLocale: Locale) => {
    await i18n.changeLanguage(newLocale);
    locale.value = newLocale;
    useCookie('locale', {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    }).value = newLocale;
  };

  return {
    t,
    locale,
    setLocale,
    supportedLocales,
    ready,
    i18n,
  };
};
