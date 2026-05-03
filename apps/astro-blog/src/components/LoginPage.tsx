import { AuthLayout, GitHubButton, LoginForm, PasskeyButton } from '@cf-blog/auth-ui';
import i18n from '@cf-blog/i18n';
import { useEffect } from 'react';

interface LoginPageProps {
  /** Current locale for i18n */
  locale: string;
  /** API base URL for auth endpoints */
  apiBaseUrl: string;
}

export default function LoginPage({ locale, apiBaseUrl }: LoginPageProps) {
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  const handleLoginSuccess = (user: { isApproved?: boolean }) => {
    if (user?.isApproved) {
      window.location.href = '/astro/admin/dashboard';
    } else {
      window.location.href = '/astro/auth/pending';
    }
  };

  const handleRegisterClick = () => {
    window.location.href = '/astro/auth/register';
  };

  const handlePasskeyComplete = () => {
    window.location.href = '/astro/admin/dashboard';
  };

  return (
    <AuthLayout title={i18n.t('auth.loginTitle')} subtitle={i18n.t('auth.loginSubtitle')}>
      <div className="space-y-4">
        <GitHubButton apiBaseUrl={apiBaseUrl} />
        <PasskeyButton
          mode="login"
          apiBaseUrl={apiBaseUrl}
          onAuthComplete={handlePasskeyComplete}
        />
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={handleRegisterClick}
          apiBaseUrl={apiBaseUrl}
        />
      </div>
    </AuthLayout>
  );
}
