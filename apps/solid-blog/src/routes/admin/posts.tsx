import { Component, createSignal, createMemo, onMount } from "solid-js";
import { useTranslation } from "~/lib/i18n";

interface Post {
  id: number;
  title: string;
  slug: string;
  framework: "next" | "nuxt" | "svelte" | "astro" | "solid";
  status: "draft" | "published";
  viewCount: number;
  createdAt: string;
}

const PostsPage: Component = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = createSignal<Post[]>([]);
  const [filter, setFilter] = createSignal<"all" | "published" | "draft">("all");
  const [loading, setLoading] = createSignal(true);

  const filteredPosts = createMemo(() => {
    const f = filter();
    if (f === "all") return posts();
    return posts().filter((p) => p.status === f);
  });

  const frameworkClass = (framework: string) => {
    const classes: Record<string, string> = {
      next: "bg-blue-100 text-blue-800",
      nuxt: "bg-green-100 text-green-800",
      svelte: "bg-orange-100 text-orange-800",
      astro: "bg-purple-100 text-purple-800",
      solid: "bg-cyan-100 text-cyan-800",
    };
    return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classes[framework] || "bg-gray-100 text-gray-800"}`;
  };

  const statusClass = (status: string) => {
    const classes: Record<string, string> = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
    };
    return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classes[status] || "bg-gray-100 text-gray-800"}`;
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("post.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts().filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  onMount(async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.data?.list || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{t("post.management")}</h1>
        <a
          href="/solid/admin/posts/new"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {t("post.new")}
        </a>
      </div>

      {/* Filter */}
      <div class="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          class={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter() === "all"
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("filter.all")} ({posts().length})
        </button>
        <button
          onClick={() => setFilter("published")}
          class={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter() === "published"
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("filter.published")} ({posts().filter((p) => p.status === "published").length})
        </button>
        <button
          onClick={() => setFilter("draft")}
          class={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter() === "draft"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("filter.draft")} ({posts().filter((p) => p.status === "draft").length})
        </button>
      </div>

      {/* Post list */}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("post.title")}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("post.framework")}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("post.status")}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("post.viewCount")}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {loading() ? (
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  {t("common.loading")}
                </td>
              </tr>
            ) : filteredPosts().length === 0 ? (
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  {t("post.noPosts")}
                </td>
              </tr>
            ) : (
              filteredPosts().map((post) => (
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{post.title}</div>
                    <div class="text-sm text-gray-500">/{post.slug}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={frameworkClass(post.framework)}>
                      {t(`framework.${post.framework}`)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={statusClass(post.status)}>{t(`post.status.${post.status}`)}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.viewCount}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <a href={`/solid/post/${post.slug}`} class="text-blue-600 hover:underline">
                      {t("common.view")}
                    </a>
                    <a
                      href={`/solid/admin/posts/edit/${post.id}`}
                      class="text-green-600 hover:underline"
                    >
                      {t("common.edit")}
                    </a>
                    <button
                      onClick={() => handleDelete(post.id)}
                      class="text-red-600 hover:underline"
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PostsPage;
