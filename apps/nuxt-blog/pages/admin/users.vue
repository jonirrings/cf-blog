<template>
  <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('user.management') }}</h1>

      <!-- 过滤器 -->
      <div class="mb-4 flex gap-2">
        <button
          v-for="option in filters"
          :key="option.value"
          @click="currentFilter = option.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium',
            currentFilter === option.value
              ? option.activeClass
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ option.label }} ({{ option.count }})
        </button>
      </div>

      <!-- 用户列表 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('user.name') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('user.role') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('common.status') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('user.publisherApplication') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('user.registrationDate') }}</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">{{ t('common.loading') }}</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">{{ t('user.noUsers') }}</td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <select
                  :value="user.role"
                  @change="handleRoleChange(user.id, ($event.target as HTMLSelectElement).value as 'admin' | 'publisher' | 'commenter')"
                  class="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="commenter">{{ t('user.role.commenter') }}</option>
                  <option value="publisher">{{ t('user.role.publisher') }}</option>
                  <option value="admin">{{ t('user.role.admin') }}</option>
                </select>
              </td>
              <td class="px-6 py-4">
                <span
                  v-if="user.isApproved"
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                >
                  {{ t('user.approved') }}
                </span>
                <button
                  v-else
                  @click="handleApproveUser(user.id)"
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                >
                  {{ t('user.approve') }}
                </button>
              </td>
              <td class="px-6 py-4">
                <template v-if="user.publisherApplicationStatus === 'none'">-</template>
                <template v-else-if="user.publisherApplicationStatus === 'pending'">
                  <div class="flex gap-2">
                    <button
                      @click="handlePublisherApplication(user.id, true)"
                      class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      {{ t('common.approve') }}
                    </button>
                    <button
                      @click="handlePublisherApplication(user.id, false)"
                      class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      {{ t('common.reject') }}
                    </button>
                  </div>
                </template>
                <template v-else-if="user.publisherApplicationStatus === 'approved'">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {{ t('user.approved') }}
                  </span>
                </template>
                <template v-else>
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {{ t('filter.rejected') }}
                  </span>
                </template>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ new Date(user.createdAt).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en') }}
              </td>
              <td class="px-6 py-4 text-right"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();

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

const filters = ref<FilterOption[]>([
  { value: 'all', label: t('filter.all'), count: 0, activeClass: 'bg-blue-100 text-blue-600' },
  { value: 'pending', label: t('user.pending'), count: 0, activeClass: 'bg-yellow-100 text-yellow-600' },
  { value: 'approved', label: t('user.approved'), count: 0, activeClass: 'bg-green-100 text-green-600' },
]);

const currentFilter = ref<'all' | 'pending' | 'approved'>('all');
const users = ref<User[]>([]);
const loading = ref(true);

const filteredUsers = computed(() => {
  if (currentFilter.value === 'all') return users.value;
  if (currentFilter.value === 'pending') return users.value.filter(u => !u.isApproved);
  if (currentFilter.value === 'approved') return users.value.filter(u => u.isApproved);
  return users.value;
});

const updateFilterCounts = () => {
  filters.value[0].count = users.value.length;
  filters.value[1].count = users.value.filter(u => !u.isApproved).length;
  filters.value[2].count = users.value.filter(u => u.isApproved).length;
};

const handleApproveUser = async (id: number) => {
  try {
    const res = await $fetch(`/api/users/${id}/approve`, { method: 'POST' });
    if (res.success) {
      users.value = users.value.map(u => u.id === id ? { ...u, isApproved: true } : u);
      updateFilterCounts();
    }
  } catch (err) {
    console.error('Approve user failed:', err);
    alert(t('form.error'));
  }
};

const handleRoleChange = async (id: number, newRole: 'admin' | 'publisher' | 'commenter') => {
  try {
    const res = await $fetch(`/api/users/${id}/role`, {
      method: 'PUT',
      body: { role: newRole },
    });
    if (res.success) {
      users.value = users.value.map(u => u.id === id ? { ...u, role: newRole } : u);
    }
  } catch (err) {
    console.error('Role change failed:', err);
    alert(t('form.error'));
  }
};

const handlePublisherApplication = async (id: number, approve: boolean) => {
  try {
    const res = await $fetch(`/api/users/${id}/publisher-application`, {
      method: 'POST',
      body: { approve },
    });
    if (res.success) {
      users.value = users.value.map(u =>
        u.id === id
          ? { ...u, publisherApplicationStatus: approve ? 'approved' : 'rejected', role: approve ? 'publisher' : u.role }
          : u
      );
      updateFilterCounts();
    }
  } catch (err) {
    console.error('Publisher application failed:', err);
    alert(t('form.error'));
  }
};

onMounted(async () => {
  try {
    const res = await $fetch('/api/users');
    users.value = res.data?.list || [];
    updateFilterCounts();
  } catch (err) {
    console.error('Failed to fetch users:', err);
  } finally {
    loading.value = false;
  }
});
</script>
