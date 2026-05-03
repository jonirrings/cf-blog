'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'publisher' | 'commenter';
  isApproved: boolean;
  publisherApplicationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        const { data } = await res.json();
        setUsers(data || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !user.isApproved;
    if (filter === 'approved') return user.isApproved;
    return true;
  });

  const handleApproveUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === id ? { ...u, isApproved: true } : u)));
      }
    } catch (err) {
      console.error('Approve user failed:', err);
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
        setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      console.error('Role change failed:', err);
    }
  };

  const handleApprovePublisherApplication = async (id: number, approve: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}/publisher-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) =>
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
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('user.management')}</h1>

      {/* 过滤器 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('filter.all')} ({users.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'pending'
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('filter.pending')} ({users.filter((u) => !u.isApproved).length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'approved'
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('user.approved')} ({users.filter((u) => u.isApproved).length})
        </button>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('user.title')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('user.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('post.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('user.publisherApplication')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('user.registrationDate')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {t('common.loading')}
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {t('user.noUsers')}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleSelect
                      value={user.role}
                      onChange={(role) => handleRoleChange(user.id, role)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    {user.isApproved ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {t('user.approved')}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      >
                        {t('user.approve')}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <PublisherApplicationStatus
                      status={user.publisherApplicationStatus}
                      onApprove={() => handleApprovePublisherApplication(user.id, true)}
                      onReject={() => handleApprovePublisherApplication(user.id, false)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 text-right"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (role: 'admin' | 'publisher' | 'commenter') => void;
}) {
  const { t } = useTranslation();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as 'admin' | 'publisher' | 'commenter')}
      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="commenter">{t('user.role.commenter')}</option>
      <option value="publisher">{t('user.role.publisher')}</option>
      <option value="admin">{t('user.role.admin')}</option>
    </select>
  );
}

function PublisherApplicationStatus({
  status,
  onApprove,
  onReject,
}: {
  status: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  const { t } = useTranslation();

  if (status === 'none') {
    return <span className="text-sm text-gray-400">-</span>;
  }

  if (status === 'pending') {
    return (
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
        >
          {t('comment.approve')}
        </button>
        <button
          onClick={onReject}
          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          {t('comment.reject')}
        </button>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        {t('comment.status.approved')}
      </span>
    );
  }

  return (
    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
      {t('comment.status.rejected')}
    </span>
  );
}
