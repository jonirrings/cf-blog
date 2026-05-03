import { Component, createSignal } from 'solid-js';
import { useTranslation } from '~/lib/i18n';
import { useNavigate } from '@solidjs/router';

const RegisterPage: Component = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [passwordConfirm, setPasswordConfirm] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (password() !== passwordConfirm()) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (password().length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name(),
          email: email(),
          password: password(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        navigate('/solid/auth/pending');
      } else {
        setError(data.error || t('auth.registerFailed'));
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
          <h1 class="text-3xl font-bold text-gray-900">{t('auth.registerTitle')}</h1>
          <p class="mt-2 text-sm text-gray-600">{t('auth.registerSubtitle')}</p>
        </div>
        <div class="bg-white py-8 px-6 rounded-lg shadow-lg">
          {error() && <div class="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error()}</div>}
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">{t('auth.nickname')}</label>
              <input
                type="text"
                required
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
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
            <div>
              <label class="block text-sm font-medium text-gray-700">
                {t('auth.passwordConfirm')}
              </label>
              <input
                type="password"
                required
                value={passwordConfirm()}
                onInput={(e) => setPasswordConfirm(e.currentTarget.value)}
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={loading()}
              class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading() ? t('auth.registering') : t('auth.register')}
            </button>
          </form>
          <div class="text-center mt-4">
            <a href="/solid/auth/login" class="text-sm text-blue-600 hover:text-blue-500">
              {t('auth.hasAccount')} {t('auth.login')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
