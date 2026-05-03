import { useNavigate } from '@solidjs/router';
import { type Component, createSignal, onMount, Show } from 'solid-js';
import { useTranslation } from '~/lib/i18n';

interface SessionInfo {
  userName: string;
  userEmail: string;
  userRole: string;
  isApproved: boolean;
}

const PendingPage: Component = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [session, setSession] = createSignal<SessionInfo | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.success && data.session) {
        if (data.session.isApproved) {
          navigate('/solid/admin');
          return;
        }
        setSession(data.session);
      } else {
        navigate('/solid/auth/login');
        return;
      }
    } catch {
      navigate('/solid/auth/login');
      return;
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div class="max-w-md w-full">
        <div class="bg-white py-8 px-6 rounded-lg shadow-lg text-center">
          <Show when={!loading()} fallback={<p class="text-gray-500">{t('common.loading')}</p>}>
            <Show when={session()}>
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg
                  class="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h1 class="text-2xl font-bold text-gray-900 mb-2">{t('auth.pendingTitle')}</h1>
              <p class="text-gray-600 mb-6">{t('auth.pendingMessage')}</p>

              <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p class="text-sm text-gray-500">{t('auth.pendingEmail')}</p>
                <p class="text-sm font-medium text-gray-900">{session()?.userEmail}</p>
              </div>

              <div class="text-left mb-6">
                <p class="text-sm font-medium text-gray-700 mb-2">{t('auth.approvalProcess')}</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li class="flex items-start">
                    <span class="text-yellow-500 mr-2">1.</span>
                    {t('auth.approvalStep1')}
                  </li>
                  <li class="flex items-start">
                    <span class="text-yellow-500 mr-2">2.</span>
                    {t('auth.approvalStep2')}
                  </li>
                  <li class="flex items-start">
                    <span class="text-yellow-500 mr-2">3.</span>
                    {t('auth.approvalStep3')}
                  </li>
                </ul>
              </div>

              <a
                href="/solid/auth/login"
                class="inline-block py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {t('auth.backToLogin')}
              </a>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default PendingPage;
