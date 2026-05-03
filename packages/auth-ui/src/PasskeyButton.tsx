import React, { useState } from 'react';
import i18n from '@cf-blog/i18n';
import type { PasskeyButtonProps } from './types';

export function PasskeyButton({ onAuthComplete, mode, apiBaseUrl }: PasskeyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');

    try {
      const baseUrl = apiBaseUrl || '';

      if (mode === 'register') {
        const challengeRes = await fetch(`${baseUrl}/api/auth/passkey/register/challenge`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!challengeRes.ok) {
          throw new Error(i18n.t('auth.passkeyFailed'));
        }

        const { options } = await challengeRes.json();

        const credential = await navigator.credentials.create({
          publicKey: options,
        });

        const verifyRes = await fetch(`${baseUrl}/api/auth/passkey/register/verify`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        });

        if (!verifyRes.ok) {
          throw new Error(i18n.t('auth.passkeyFailed'));
        }

        onAuthComplete?.();
      } else {
        const challengeRes = await fetch(`${baseUrl}/api/auth/passkey/login/challenge`, {
          method: 'POST',
        });

        if (!challengeRes.ok) {
          throw new Error(i18n.t('auth.passkeyFailed'));
        }

        const { options } = await challengeRes.json();

        const credential = await navigator.credentials.get({
          publicKey: options,
        });

        const verifyRes = await fetch(`${baseUrl}/api/auth/passkey/login/verify`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        });

        if (!verifyRes.ok) {
          throw new Error(i18n.t('auth.passkeyFailed'));
        }

        onAuthComplete?.();
      }
    } catch (err: any) {
      console.error('Passkey error:', err);
      setError(err.message || i18n.t('auth.passkeyFailed'));
    } finally {
      setLoading(false);
    }
  };

  const isSupported = window.PublicKeyCredential !== undefined;

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
      >
        {i18n.t('auth.passkeyUnsupported')}
      </button>
    );
  }

  return (
    <>
      {error && <div className="bg-red-50 text-red-600 p-2 rounded text-xs mb-3">{error}</div>}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
        {loading
          ? i18n.t('auth.passkeyProcessing')
          : mode === 'register'
            ? i18n.t('auth.passkeyRegister')
            : i18n.t('auth.passkey')}
      </button>
    </>
  );
}
