import { type Component, createSignal, onMount, createMemo } from 'solid-js';
import { useTranslation } from '~/lib/i18n';

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  pendingComments: number;
  totalUsers: number;
  pendingUsers: number;
  totalViews: number;
}

const AdminPage: Component = () => {
  const { t } = useTranslation();
  const [stats, setStats] = createSignal<Stats | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  });

  const statCards = createMemo(() => {
    const s = stats();
    if (!s) return [];
    return [
      {
        title: t('stats.totalPosts'),
        value: s.totalPosts,
        sub: `${s.publishedPosts} ${t('post.status.published')} · ${s.draftPosts} ${t('post.status.draft')}`,
      },
      {
        title: t('stats.totalComments'),
        value: s.totalComments,
        sub: `${s.pendingComments} ${t('comment.pending')}`,
      },
      {
        title: t('stats.totalUsers'),
        value: s.totalUsers,
        sub: `${s.pendingUsers} ${t('user.pending')}`,
      },
      { title: t('stats.totalViews'), value: s.totalViews, sub: t('stats.totalViews.sub') },
    ];
  });

  return (
    <>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{t('admin.dashboard')}</h1>

      {loading() ? (
        <p class="text-gray-500">{t('common.loading')}</p>
      ) : stats() ? (
        <>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards().map((card) => (
              <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">{card.title}</h3>
                <p class="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p class="text-sm text-gray-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/solid/admin/posts"
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('post.management')}</h2>
              <p class="text-gray-500">{t('admin.quickActions.newPost')}</p>
            </a>
            <a
              href="/solid/admin/comments"
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('comment.management')}</h2>
              <p class="text-gray-500">{t('admin.quickActions.approveComments')}</p>
            </a>
            <a
              href="/solid/admin/users"
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('user.management')}</h2>
              <p class="text-gray-500">{t('admin.quickActions.userManagement')}</p>
            </a>
            <a
              href="/solid/admin/settings"
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('admin.settings')}</h2>
              <p class="text-gray-500">{t('admin.quickActions.settings')}</p>
            </a>
          </div>
        </>
      ) : null}
    </>
  );
};

export default AdminPage;
