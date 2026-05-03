'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface SiteConfig {
  title: string;
  description: string;
  logo?: string;
  footerText?: string;
  enableComments: boolean;
  enableAnalytics: boolean;
}

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<SiteConfig>({
    title: 'Cloudflare Blog',
    description: 'Multi-framework blog demo',
    logo: '',
    footerText: '',
    enableComments: true,
    enableAnalytics: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/config/site');
        const { data } = await res.json();
        if (data) {
          setConfig(data);
        }
      } catch (err) {
        console.error('Failed to fetch config:', err);
      }
    }

    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/config/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.settings')}</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* 保存提示 */}
        {saved && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg">{t('settings.saved')}</div>
        )}

        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.basicInfo')}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.siteTitle')}
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.siteDesc')}
              </label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.logoUrl')}
              </label>
              <input
                type="url"
                value={config.logo}
                onChange={(e) => setConfig({ ...config, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.footerText')}
              </label>
              <input
                type="text"
                value={config.footerText}
                onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 功能开关 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('settings.featureToggles')}
          </h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {t('settings.enableComments')}
              </span>
              <input
                type="checkbox"
                checked={config.enableComments}
                onChange={(e) => setConfig({ ...config, enableComments: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {t('settings.enableAnalytics')}
              </span>
              <input
                type="checkbox"
                checked={config.enableAnalytics}
                onChange={(e) => setConfig({ ...config, enableAnalytics: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('settings.saving') : t('settings.saveConfig')}
          </button>
        </div>
      </form>
    </div>
  );
}
