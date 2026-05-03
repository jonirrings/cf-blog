'use client';

import { useTranslation } from '@/lib/i18n';
import { supportedLocales, type Locale } from '@cf-blog/i18n';

export function LanguageSwitcher() {
  const { locale, changeLocale } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    changeLocale(newLocale);
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Select language"
    >
      {supportedLocales.map((loc) => (
        <option key={loc.code} value={loc.code}>
          {loc.flag} {loc.name}
        </option>
      ))}
    </select>
  );
}
