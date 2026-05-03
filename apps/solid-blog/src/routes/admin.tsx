import { type Locale, supportedLocales } from '@cf-blog/i18n';
import { useNavigate } from '@solidjs/router';
import { type Component, createSignal, type JSX, onMount, Show } from 'solid-js';
import { useTranslation } from '~/lib/i18n';

interface SessionInfo {
  userName: string;
  userEmail: string;
  userRole: string;
  isApproved: boolean;
}

const AdminLayout: Component<{ children?: JSX.Element }> = (props) => {
  const { t, locale, changeLocale } = useTranslation();
  const navigate = useNavigate();
  const [session, setSession] = createSignal<SessionInfo | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.success && data.session) {
        if (data.session.userRole !== 'admin') {
          navigate('/solid/');
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

  const navItems = [
    { href: '/solid/admin', label: t('admin.dashboard'), icon: '📊' },
    { href: '/solid/admin/posts', label: t('admin.posts'), icon: '📝' },
    { href: '/solid/admin/comments', label: t('admin.comments'), icon: '💬' },
    { href: '/solid/admin/users', label: t('admin.users'), icon: '👥' },
    { href: '/solid/admin/settings', label: t('admin.settings'), icon: '⚙️' },
  ];

  return (
    <Show
      when={!loading()}
      fallback={
        <div class="flex items-center justify-center min-h-screen">
          <p>{t('common.loading')}</p>
        </div>
      }
    >
      <Show when={session()}>
        <div class="flex min-h-screen bg-gray-100">
          <aside class="w-64 bg-white shadow-lg fixed h-full flex flex-col">
            <div class="p-6 border-b">
              <h2 class="text-xl font-bold text-gray-900">{t('admin.title')}</h2>
              <a href="/solid/" class="text-sm text-blue-600 hover:underline">
                {t('admin.backToBlog')}
              </a>
            </div>
            <nav class="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <a
                  href={item.href}
                  class="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  {item.icon} {item.label}
                </a>
              ))}
            </nav>
            <div class="p-4 border-t">
              <select
                class="w-full px-3 py-2 border rounded-md text-sm"
                value={locale()}
                onChange={(e) => changeLocale(e.currentTarget.value as Locale)}
              >
                {supportedLocales.map((loc) => (
                  <option value={loc.code}>
                    {loc.flag} {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div class="p-4 border-t">
              <p class="font-medium text-gray-900">{session()?.userName}</p>
              <p class="text-sm text-gray-500">{t(`user.role.${session()?.userRole}`)}</p>
            </div>
          </aside>
          <main class="ml-64 flex-1 p-6">{props.children}</main>
        </div>
      </Show>
    </Show>
  );
};

export default AdminLayout;
