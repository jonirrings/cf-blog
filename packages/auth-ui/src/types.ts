export interface LoginFormProps {
  onLoginSuccess?: (user: any) => void;
  onRegisterClick?: () => void;
  apiBaseUrl?: string;
}

export interface RegisterFormProps {
  onRegisterSuccess?: (user: any) => void;
  onLoginClick?: () => void;
  apiBaseUrl?: string;
}

export interface PasskeyButtonProps {
  onAuthComplete?: () => void;
  mode: 'register' | 'login';
  apiBaseUrl?: string;
}

export interface GitHubButtonProps {
  onAuthComplete?: () => void;
  apiBaseUrl?: string;
}

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}
