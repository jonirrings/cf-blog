'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';

interface Comment {
  id: number;
  postId: number;
  postTitle: string;
  userId: number;
  userName: string;
  content: string;
  userApproved: boolean;
  postApproved: boolean;
  rejected: boolean;
  createdAt: string;
}

export default function AdminCommentsPage() {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch('/api/comments');
        const { data } = await res.json();
        setComments(data || []);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, []);

  const filteredComments = comments.filter((comment) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !comment.userApproved || !comment.postApproved;
    if (filter === 'approved') return comment.userApproved && comment.postApproved;
    if (filter === 'rejected') return comment.rejected;
    return true;
  });

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/comments/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approveType: 'user' }),
      });

      if (res.ok) {
        setComments(comments.map((c) => (c.id === id ? { ...c, userApproved: true } : c)));
      }
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt(t('comment.rejectReason'));
    if (!reason) return;

    try {
      const res = await fetch(`/api/comments/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        setComments(
          comments.map((c) => (c.id === id ? { ...c, rejected: true, rejectReason: reason } : c))
        );
      }
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('comment.management')}</h1>

      {/* 过滤器 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'pending'
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('filter.pending')} ({comments.filter((c) => !c.userApproved || !c.postApproved).length}
          )
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'approved'
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('filter.approved')} ({comments.filter((c) => c.userApproved && c.postApproved).length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'rejected'
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('filter.rejected')} ({comments.filter((c) => c.rejected).length})
        </button>
      </div>

      {/* 评论列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">{t('common.loading')}</div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">{t('comment.noComments')}</div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    {t('comment.commentedOn')}{' '}
                    <a
                      href={`/next/post/${comment.postId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {comment.postTitle}
                    </a>
                  </span>
                </div>
                <div className="flex gap-2">
                  <StatusBadge
                    userApproved={comment.userApproved}
                    postApproved={comment.postApproved}
                    rejected={comment.rejected}
                  />
                </div>
              </div>

              <p className="text-gray-700 mb-4">{comment.content}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {new Date(comment.createdAt).toLocaleString('zh-CN')}
                </span>

                {!comment.rejected && (!comment.userApproved || !comment.postApproved) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      {t('comment.approve')}
                    </button>
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      {t('comment.reject')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  userApproved,
  postApproved,
  rejected,
}: {
  userApproved: boolean;
  postApproved: boolean;
  rejected: boolean;
}) {
  const { t } = useTranslation();

  if (rejected) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        {t('comment.status.rejected')}
      </span>
    );
  }

  if (userApproved && postApproved) {
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        {t('comment.status.approved')}
      </span>
    );
  }

  return (
    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
      {t('comment.status.pending')}
    </span>
  );
}
