import { type Component, createSignal } from 'solid-js';
import { useTranslation } from '~/lib/i18n';
import { useNavigate } from '@solidjs/router';

const LoginPage: Component = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email(), password: password() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user.isApproved) {
          navigate('/solid/admin');
        } else {
          navigate('/solid/auth/pending');
        }
      } else {
        setError(data.error || t('auth.loginFailed'));
      }
    } catch {
      setError(t('auth.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">{t('auth.loginTitle')}</h1>
          <p class="mt-2 text-sm text-gray-600">{t('auth.loginSubtitle')}</p>
        </div>
        <div class="bg-white py-8 px-6 rounded-lg shadow-lg">
          {error() && <div class="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error()}</div>}
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">{t('auth.password')}</label>
              <input
                type="password"
                required
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={loading()}
              class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading() ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>
          <div class="text-center mt-4">
            <a href="/solid/auth/register" class="text-sm text-blue-600 hover:text-blue-500">
              {t('auth.noAccount')} {t('auth.register')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
