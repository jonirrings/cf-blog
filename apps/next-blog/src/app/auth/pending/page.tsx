'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (data.session) {
          setUser({ name: data.session.userName, email: data.session.userEmail });
        } else {
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.pendingTitle')}</h1>
          <p className="text-gray-600 mb-6">{t('auth.pendingMessage')}</p>

          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">{t('auth.pendingEmail')}</p>
              <p className="text-lg font-medium text-gray-900">{user.email}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm text-left">
              <p className="font-semibold mb-1">{t('auth.approvalProcess')}</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{t('auth.approvalStep1')}</li>
                <li>{t('auth.approvalStep2')}</li>
                <li>{t('auth.approvalStep3')}</li>
              </ol>
            </div>

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              {t('auth.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
