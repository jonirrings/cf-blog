<script lang="ts">
  import { t } from '$lib/i18n';
  import { onMount } from 'svelte';

  interface User {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'publisher' | 'commenter';
    isApproved: boolean;
    publisherApplicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }

  interface FilterOption {
    value: 'all' | 'pending' | 'approved';
    label: string;
    count: number;
    activeClass: string;
  }

  let filters: FilterOption[] = [
    { value: 'all', label: t('filter.all'), count: 0, activeClass: 'bg-blue-100 text-blue-600' },
    { value: 'pending', label: t('filter.pending'), count: 0, activeClass: 'bg-yellow-100 text-yellow-600' },
    { value: 'approved', label: t('filter.approved'), count: 0, activeClass: 'bg-green-100 text-green-600' },
  ];

  let currentFilter: 'all' | 'pending' | 'approved' = 'all';
  let users: User[] = [];
  let loading = $state(true);

  $derived(filteredUsers = users.filter((user) => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'pending') return !user.isApproved;
    if (currentFilter === 'approved') return user.isApproved;
    return true;
  }));

  function updateFilterCounts() {
    filters[0].count = users.length;
    filters[1].count = users.filter((u) => !u.isApproved).length;
    filters[2].count = users.filter((u) => u.isApproved).length;
  }

  const handleApproveUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        users = users.map((u) => (u.id === id ? { ...u, isApproved: true } : u));
        updateFilterCounts();
      }
    } catch (err) {
      console.error('Approve user failed:', err);
      alert(t('user.approveFailed'));
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
        users = users.map((u) => (u.id === id ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error('Role change failed:', err);
      alert(t('user.roleChangeFailed'));
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
        users = users.map((u) =>
          u.id === id
            ? { ...u, publisherApplicationStatus: approve ? 'approved' : 'rejected', role: approve ? 'publisher' : u.role }
            : u
        );
        updateFilterCounts();
      }
    } catch (err) {
      console.error('Publisher application failed:', err);
      alert(t('user.publisherApplication.actionFailed'));
    }
  };

  onMount(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      users = data.data?.list || [];
      updateFilterCounts();
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h1 class="text-2xl font-bold text-gray-900 mb-6">{t('user.management')}</h1>

  <!-- Filter -->
  <div class="mb-4 flex gap-2">
    {#each filters as option}
      <button
        onclick={() => (currentFilter = option.value)}
        class="px-4 py-2 rounded-lg text-sm font-medium {currentFilter === option.value ? option.activeClass : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
      >
        {option.label} ({option.count})
      </button>
    {/each}
  </div>

  <!-- User list -->
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user.name')}</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user.role')}</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('post.status')}</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user.publisherApplication')}</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user.registrationDate')}</th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        {#if loading}
          <tr>
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">{t('common.loading')}</td>
          </tr>
        {:else if filteredUsers.length === 0}
          <tr>
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">{t('user.noUsers')}</td>
          </tr>
        {:else}
          {#each filteredUsers as user}
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
                  onchange={(e) => handleRoleChange(user.id, (e.target as HTMLSelectElement).value as 'admin' | 'publisher' | 'commenter')}
                  class="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="commenter">{t('user.role.commenter')}</option>
                  <option value="publisher">{t('user.role.publisher')}</option>
                  <option value="admin">{t('user.role.admin')}</option>
                </select>
              </td>
              <td class="px-6 py-4">
                {#if user.isApproved}
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {t('user.approved')}
                  </span>
                {:else}
                  <button
                    onclick={() => handleApproveUser(user.id)}
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  >
                    {t('user.approve')}
                  </button>
                {/if}
              </td>
              <td class="px-6 py-4">
                {#if user.publisherApplicationStatus === 'none'}
                  -
                {:else if user.publisherApplicationStatus === 'pending'}
                  <div class="flex gap-2">
                    <button
                      onclick={() => handlePublisherApplication(user.id, true)}
                      class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      {t('comment.approve')}
                    </button>
                    <button
                      onclick={() => handlePublisherApplication(user.id, false)}
                      class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      {t('comment.reject')}
                    </button>
                  </div>
                {:else if user.publisherApplicationStatus === 'approved'}
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {t('user.approved')}
                  </span>
                {:else}
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {t('comment.status.rejected')}
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td class="px-6 py-4 text-right"></td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
