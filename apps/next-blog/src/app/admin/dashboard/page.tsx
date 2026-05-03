'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  pendingComments: number;
  totalUsers: number;
  pendingUsers: number;
  totalViews: number;
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
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
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-gray-500">{t('common.loading')}</div>;
  }

  const statCards = [
    {
      title: t('stats.totalPosts'),
      value: stats?.totalPosts,
      sub: `${stats?.publishedPosts} ${t('post.status.published')} · ${stats?.draftPosts} ${t('post.status.draft')}`,
      color: 'blue',
    },
    {
      title: t('stats.totalComments'),
      value: stats?.totalComments,
      sub: `${stats?.pendingComments} ${t('comment.pending')}`,
      color: 'green',
    },
    {
      title: t('stats.totalUsers'),
      value: stats?.totalUsers,
      sub: `${stats?.pendingUsers} ${t('user.pending')}`,
      color: 'purple',
    },
    {
      title: t('stats.totalViews'),
      value: stats?.totalViews,
      sub: t('stats.totalViews.sub'),
      color: 'orange',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.dashboard')}</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`flex-1`}>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{card.value}</p>
                <p className="mt-1 text-sm text-gray-400">{card.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.quickActions')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/posts"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900">{t('post.new')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('admin.quickActions.newPost')}</p>
          </a>
          <a
            href="/admin/comments"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900">{t('admin.approveComments')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('admin.quickActions.approveComments')}</p>
          </a>
          <a
            href="/admin/users"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900">{t('admin.userManagement')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('admin.quickActions.userManagement')}</p>
          </a>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.recentActivity')}</h2>
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('admin.activity.newPost')}</p>
                  <p className="text-sm text-gray-500">2 {t('admin.activity.time.hour')}</p>
                </div>
                <span className="text-sm text-blue-600">{t('admin.viewDetails')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
