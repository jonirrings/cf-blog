import { Component, createSignal, For, onMount, createMemo } from 'solid-js';
import { useTranslation } from '~/lib/i18n';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'publisher' | 'commenter';
  isApproved: boolean;
  publisherApplicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const UsersPage: Component = () => {
  const { t } = useTranslation();

  const [users, setUsers] = createSignal<User[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [currentFilter, setCurrentFilter] = createSignal<'all' | 'pending' | 'approved'>('all');

  const filters = [
    { value: 'all' as const, label: t('filter.all'), activeClass: 'bg-blue-100 text-blue-600' },
    {
      value: 'pending' as const,
      label: t('filter.pending'),
      activeClass: 'bg-yellow-100 text-yellow-600',
    },
    {
      value: 'approved' as const,
      label: t('filter.approved'),
      activeClass: 'bg-green-100 text-green-600',
    },
  ];

  const filteredUsers = createMemo(() => {
    const filter = currentFilter();
    if (filter === 'all') return users();
    if (filter === 'pending') return users().filter((u) => !u.isApproved);
    if (filter === 'approved') return users().filter((u) => u.isApproved);
    return users();
  });

  const filterCounts = createMemo(() => ({
    all: users().length,
    pending: users().filter((u) => !u.isApproved).length,
    approved: users().filter((u) => u.isApproved).length,
  }));

  onMount(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.data?.list || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  });

  const handleApproveUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setUsers(users().map((u) => (u.id === id ? { ...u, isApproved: true } : u)));
      }
    } catch (err) {
      console.error('Approve user failed:', err);
      alert(t('form.error'));
    }
  };

  const handleRoleChange = async (id: number, newRole: 'admin' | 'publisher' | 'commenter') => {
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users().map((u) => (u.id === id ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      console.error('Role change failed:', err);
      alert(t('form.error'));
    }
  };

  const handlePublisherApplication = async (id: number, approve: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}/publisher-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      });
      if (res.ok) {
        setUsers(
          users().map((u) =>
            u.id === id
              ? {
                  ...u,
                  publisherApplicationStatus: approve ? 'approved' : 'rejected',
                  role: approve ? 'publisher' : u.role,
                }
              : u
          )
        );
      }
    } catch (err) {
      console.error('Publisher application failed:', err);
      alert(t('form.error'));
    }
  };

  return (
    <>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{t('user.management')}</h1>

      {/* Filter */}
      <div class="mb-4 flex gap-2">
        <For each={filters}>
          {(option) => (
            <button
              onClick={() => setCurrentFilter(option.value)}
              classList={{
                'px-4 py-2 rounded-lg text-sm font-medium': true,
                [option.activeClass]: currentFilter() === option.value,
                'bg-gray-100 text-gray-600 hover:bg-gray-200': currentFilter() !== option.value,
              }}
            >
              {option.label} ({filterCounts()[option.value]})
            </button>
          )}
        </For>
      </div>

      {/* User list */}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('user.name')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('user.role')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('common.status')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('user.publisherApplication')}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('user.registrationDate')}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {loading() ? (
              <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  {t('common.loading')}
                </td>
              </tr>
            ) : filteredUsers().length === 0 ? (
              <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  {t('user.noUsers')}
                </td>
              </tr>
            ) : (
              <For each={filteredUsers()}>
                {(user) => (
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{user.name}</div>
                        <div class="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.currentTarget.value as 'admin' | 'publisher' | 'commenter'
                          )
                        }
                        class="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="commenter">{t('user.role.commenter')}</option>
                        <option value="publisher">{t('user.role.publisher')}</option>
                        <option value="admin">{t('user.role.admin')}</option>
                      </select>
                    </td>
                    <td class="px-6 py-4">
                      {user.isApproved ? (
                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {t('user.approved')}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                          {t('user.approve')}
                        </button>
                      )}
                    </td>
                    <td class="px-6 py-4">
                      {user.publisherApplicationStatus === 'none' && '-'}
                      {user.publisherApplicationStatus === 'pending' && (
                        <div class="flex gap-2">
                          <button
                            onClick={() => handlePublisherApplication(user.id, true)}
                            class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            {t('comment.approve')}
                          </button>
                          <button
                            onClick={() => handlePublisherApplication(user.id, false)}
                            class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            {t('comment.reject')}
                          </button>
                        </div>
                      )}
                      {user.publisherApplicationStatus === 'approved' && (
                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {t('user.approved')}
                        </span>
                      )}
                      {user.publisherApplicationStatus === 'rejected' && (
                        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {t('comment.status.rejected')}
                        </span>
                      )}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 text-right"></td>
                  </tr>
                )}
              </For>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UsersPage;
