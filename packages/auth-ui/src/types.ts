interface AuthUser {
  id?: number;
  email?: string;
  name?: string;
  role?: string;
  isApproved?: boolean;
}

export interface LoginFormProps {
  onLoginSuccess?: (user: AuthUser) => void;
  onRegisterClick?: () => void;
  apiBaseUrl?: string;
}

export interface RegisterFormProps {
  onRegisterSuccess?: (user: AuthUser) => void;
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
