<script lang="ts">
  import { t } from '$lib/i18n';
  import { onMount } from 'svelte';

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

  interface FilterOption {
    value: 'pending' | 'approved' | 'rejected';
    label: string;
    count: number;
    activeClass: string;
  }

  let filters: FilterOption[] = [
    { value: 'pending', label: t('comment.status.pending'), count: 0, activeClass: 'bg-yellow-100 text-yellow-600' },
    { value: 'approved', label: t('comment.status.approved'), count: 0, activeClass: 'bg-green-100 text-green-600' },
    { value: 'rejected', label: t('comment.status.rejected'), count: 0, activeClass: 'bg-red-100 text-red-600' },
  ];

  let currentFilter: 'pending' | 'approved' | 'rejected' = 'pending';
  let comments: Comment[] = [];
  let loading = $state(true);

  $derived(filteredComments = comments.filter((comment) => {
    if (currentFilter === 'pending') return !comment.userApproved || !comment.postApproved;
    if (currentFilter === 'approved') return comment.userApproved && comment.postApproved;
    if (currentFilter === 'rejected') return comment.rejected;
    return true;
  }));

  function updateFilterCounts() {
    filters[0].count = comments.filter((c) => !c.userApproved || !c.postApproved).length;
    filters[1].count = comments.filter((c) => c.userApproved && c.postApproved).length;
    filters[2].count = comments.filter((c) => c.rejected).length;
  }

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/comments/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approveType: 'user' }),
      });
      if (res.ok) {
        comments = comments.map((c) => (c.id === id ? { ...c, userApproved: true } : c));
        updateFilterCounts();
      }
    } catch (err) {
      console.error('Approve failed:', err);
      alert(t('comment.approveFailed'));
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt(t('comment.rejectReason') || '');
    if (!reason) return;

    try {
      const res = await fetch(`/api/comments/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        comments = comments.map((c) => (c.id === id ? { ...c, rejected: true } : c));
        updateFilterCounts();
      }
    } catch (err) {
      console.error('Reject failed:', err);
      alert(t('comment.rejectFailed'));
    }
  };

  onMount(async () => {
    try {
      const res = await fetch('/api/comments');
      const data = await res.json();
      comments = data.data?.list || [];
      updateFilterCounts();
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div>
  <h1 class="text-2xl font-bold text-gray-900 mb-6">{t('comment.management')}</h1>

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

  <!-- Comment list -->
  <div class="space-y-4">
    {#if loading}
      <div class="text-center text-gray-500 py-8">{t('common.loading')}</div>
    {:else if filteredComments.length === 0}
      <div class="text-center text-gray-500 py-8">{t('comment.noComments')}</div>
    {:else}
      {#each filteredComments as comment}
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-start justify-between mb-3">
            <div>
              <span class="text-sm font-medium text-gray-900">{comment.userName}</span>
              <span class="mx-2 text-gray-300">|</span>
              <span class="text-sm text-gray-500">
                {t('comment.commentedOn')}
                <a href="/svelte/post/{comment.postId}" class="text-blue-600 hover:underline">{comment.postTitle}</a>
              </span>
            </div>
            <div class="flex gap-2">
              {#if comment.rejected}
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  {t('comment.status.rejected')}
                </span>
              {:else if comment.userApproved && comment.postApproved}
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {t('comment.status.approved')}
                </span>
              {:else}
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {t('comment.status.pending')}
                </span>
              {/if}
            </div>
          </div>

          <p class="text-gray-700 mb-4">{comment.content}</p>

          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-400">
              {new Date(comment.createdAt).toLocaleString()}
            </span>

            {#if !comment.rejected && (!comment.userApproved || !comment.postApproved)}
              <div class="flex gap-2">
                <button
                  onclick={() => handleApprove(comment.id)}
                  class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  {t('comment.approve')}
                </button>
                <button
                  onclick={() => handleReject(comment.id)}
                  class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  {t('comment.reject')}
                </button>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
