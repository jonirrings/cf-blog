import { Component, createSignal, For, onMount, createMemo } from "solid-js";
import { useTranslation } from "~/lib/i18n";

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

const CommentsPage: Component = () => {
  const { t } = useTranslation();

  const [comments, setComments] = createSignal<Comment[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [currentFilter, setCurrentFilter] = createSignal<"pending" | "approved" | "rejected">(
    "pending",
  );

  const filters = [
    {
      value: "pending" as const,
      label: t("comment.status.pending"),
      activeClass: "bg-yellow-100 text-yellow-600",
    },
    {
      value: "approved" as const,
      label: t("comment.status.approved"),
      activeClass: "bg-green-100 text-green-600",
    },
    {
      value: "rejected" as const,
      label: t("comment.status.rejected"),
      activeClass: "bg-red-100 text-red-600",
    },
  ];

  const filteredComments = createMemo(() => {
    const filter = currentFilter();
    if (filter === "pending") return comments().filter((c) => !c.userApproved || !c.postApproved);
    if (filter === "approved") return comments().filter((c) => c.userApproved && c.postApproved);
    if (filter === "rejected") return comments().filter((c) => c.rejected);
    return comments();
  });

  const filterCounts = createMemo(() => ({
    pending: comments().filter((c) => !c.userApproved || !c.postApproved).length,
    approved: comments().filter((c) => c.userApproved && c.postApproved).length,
    rejected: comments().filter((c) => c.rejected).length,
  }));

  onMount(async () => {
    try {
      const res = await fetch("/api/comments");
      const data = await res.json();
      setComments(data.data?.list || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  });

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/comments/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approveType: "user" }),
      });
      if (res.ok) {
        setComments(comments().map((c) => (c.id === id ? { ...c, userApproved: true } : c)));
      }
    } catch (err) {
      console.error("Approve failed:", err);
      alert(t("comment.approveFailed"));
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt(t("comment.rejectReason"));
    if (!reason) return;

    try {
      const res = await fetch(`/api/comments/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setComments(comments().map((c) => (c.id === id ? { ...c, rejected: true } : c)));
      }
    } catch (err) {
      console.error("Reject failed:", err);
      alert(t("comment.rejectFailed"));
    }
  };

  const getStatusBadge = (comment: Comment) => {
    if (comment.rejected) {
      return (
        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          {t("comment.status.rejected")}
        </span>
      );
    }
    if (comment.userApproved && comment.postApproved) {
      return (
        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {t("comment.status.approved")}
        </span>
      );
    }
    return (
      <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        {t("comment.status.pending")}
      </span>
    );
  };

  return (
    <>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{t("comment.management")}</h1>

      {/* Filter */}
      <div class="mb-4 flex gap-2">
        <For each={filters}>
          {(option) => (
            <button
              onClick={() => setCurrentFilter(option.value)}
              classList={{
                "px-4 py-2 rounded-lg text-sm font-medium": true,
                [option.activeClass]: currentFilter() === option.value,
                "bg-gray-100 text-gray-600 hover:bg-gray-200": currentFilter() !== option.value,
              }}
            >
              {option.label} ({filterCounts()[option.value]})
            </button>
          )}
        </For>
      </div>

      {/* Comment list */}
      <div class="space-y-4">
        {loading() ? (
          <div class="text-center text-gray-500 py-8">{t("common.loading")}</div>
        ) : filteredComments().length === 0 ? (
          <div class="text-center text-gray-500 py-8">{t("comment.noComments")}</div>
        ) : (
          <For each={filteredComments()}>
            {(comment) => (
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <span class="text-sm font-medium text-gray-900">{comment.userName}</span>
                    <span class="mx-2 text-gray-300">|</span>
                    <span class="text-sm text-gray-500">
                      {t("comment.commentedOn")}
                      <a
                        href={`/solid/post/${comment.postId}`}
                        class="text-blue-600 hover:underline"
                      >
                        {comment.postTitle}
                      </a>
                    </span>
                  </div>
                  <div class="flex gap-2">{getStatusBadge(comment)}</div>
                </div>

                <p class="text-gray-700 mb-4">{comment.content}</p>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>

                  {!comment.rejected && (!comment.userApproved || !comment.postApproved) && (
                    <div class="flex gap-2">
                      <button
                        onClick={() => handleApprove(comment.id)}
                        class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        {t("comment.approve")}
                      </button>
                      <button
                        onClick={() => handleReject(comment.id)}
                        class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        {t("comment.reject")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </For>
        )}
      </div>
    </>
  );
};

export default CommentsPage;
