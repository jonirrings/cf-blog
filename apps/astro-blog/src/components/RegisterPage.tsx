import { AuthLayout, GitHubButton, PasskeyButton, RegisterForm } from '@cf-blog/auth-ui';
import i18n from '@cf-blog/i18n';
import { useEffect } from 'react';

interface RegisterPageProps {
  /** Current locale for i18n */
  locale: string;
  /** API base URL for auth endpoints */
  apiBaseUrl: string;
}

export default function RegisterPage({ locale, apiBaseUrl }: RegisterPageProps) {
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  const handleRegisterSuccess = (user: { isApproved?: boolean }) => {
    if (user?.isApproved) {
      window.location.href = '/astro/admin/dashboard';
    } else {
      window.location.href = '/astro/auth/pending';
    }
  };

  const handleLoginClick = () => {
    window.location.href = '/astro/auth/login';
  };

  const handlePasskeyComplete = () => {
    window.location.href = '/astro/admin/dashboard';
  };

  return (
    <AuthLayout title={i18n.t('auth.registerTitle')} subtitle={i18n.t('auth.registerSubtitle')}>
      <div className="space-y-4">
        <GitHubButton apiBaseUrl={apiBaseUrl} />
        <PasskeyButton
          mode="register"
          apiBaseUrl={apiBaseUrl}
          onAuthComplete={handlePasskeyComplete}
        />
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onLoginClick={handleLoginClick}
          apiBaseUrl={apiBaseUrl}
        />
      </div>
    </AuthLayout>
  );
}
