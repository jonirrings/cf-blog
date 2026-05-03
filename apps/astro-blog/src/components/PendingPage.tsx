import i18n from '@cf-blog/i18n';
import { useEffect, useState } from 'react';

interface PendingPageProps {
  /** Current locale for i18n */
  locale: string;
  /** API base URL for auth endpoints */
  apiBaseUrl: string;
}

interface SessionData {
  user?: {
    email?: string;
    name?: string;
    isApproved?: boolean;
  };
}

export default function PendingPage({ locale, apiBaseUrl }: PendingPageProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/session`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.session) {
          setSession(data.session);
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">{i18n.t('common.loading')}</p>
      </div>
    );
  }

  // If user is approved, redirect to admin
  if (session?.user?.isApproved) {
    window.location.href = '/astro/admin/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{i18n.t('auth.pendingTitle')}</h1>
          <p className="mt-2 text-sm text-gray-600">{i18n.t('auth.pendingMessage')}</p>
        </div>

        <div className="bg-white py-8 px-6 rounded-lg shadow-lg">
          {session?.user?.email && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{i18n.t('auth.pendingEmail')}</p>
              <p className="text-sm font-medium text-gray-900">{session.user.email}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {i18n.t('auth.approvalProcess')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">1.</span>
                {i18n.t('auth.approvalStep1')}
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">2.</span>
                {i18n.t('auth.approvalStep2')}
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">3.</span>
                {i18n.t('auth.approvalStep3')}
              </li>
            </ul>
          </div>

          <a
            href="/astro/auth/login"
            className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {i18n.t('auth.backToLogin')}
          </a>
        </div>
      </div>
    </div>
  );
}
