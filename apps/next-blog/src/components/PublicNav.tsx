'use client';

import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n';

const frameworks = [
  { href: '/next/', labelKey: 'framework.next', color: 'text-blue-600' },
  { href: '/nuxt/', labelKey: 'framework.nuxt', color: 'text-green-600' },
  { href: '/svelte/', labelKey: 'framework.svelte', color: 'text-orange-600' },
  { href: '/astro/', labelKey: 'framework.astro', color: 'text-purple-600' },
  { href: '/solid/', labelKey: 'framework.solid', color: 'text-blue-500' },
] as const;

export function PublicNav() {
  const { t } = useTranslation();

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold">Next.js Blog</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            {t('auth.login')}
          </Link>
        </div>
      </div>
      <nav className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
        <span className="font-semibold mr-2">{t('site.frameworkSwitch')}</span>
        {frameworks.map((fw) => (
          <a key={fw.href} href={fw.href} className={`${fw.color} hover:underline text-sm`}>
            {t(fw.labelKey)}
          </a>
        ))}
      </nav>
    </header>
  );
}
