import React, { useState } from 'react';
import i18n from '@cf-blog/i18n';
import type { LoginFormProps } from './types';

export function LoginForm({ onLoginSuccess, onRegisterClick, apiBaseUrl }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiBaseUrl || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess?.(data.user);
      } else {
        setError(data.error || i18n.t('auth.loginFailed'));
      }
    } catch (err) {
      setError(i18n.t('auth.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {i18n.t('auth.email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {i18n.t('auth.password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? i18n.t('auth.loggingIn') : i18n.t('auth.login')}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{i18n.t('auth.or')}</span>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onRegisterClick}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {i18n.t('auth.noAccount')} {i18n.t('auth.register')}
        </button>
      </div>
    </form>
  );
}
