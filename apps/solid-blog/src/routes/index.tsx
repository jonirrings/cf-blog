import { createResource, For } from "solid-js";
import { A } from "@solidjs/router";
import { useTranslation } from "~/lib/i18n";
import { PublicNav } from "~/components/PublicNav";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  created_at: string;
}

async function fetchPosts(): Promise<Post[]> {
  const api_url = import.meta.env.PUBLIC_API_URL || "http://localhost:8788";
  const res = await fetch(`${api_url}/api/posts`);
  const { data } = await res.json();
  return data || [];
}

export default function HomePage() {
  const { t, locale } = useTranslation();
  const [posts] = createResource(fetchPosts);

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(locale() === "zh-CN" ? "zh-CN" : "en");
  }

  return (
    <div class="min-h-screen">
      <PublicNav />

      <main class="max-w-4xl mx-auto px-4 py-8">
        <section>
          <h2 class="text-2xl font-semibold mb-4 text-gray-900">{t("site.latestPosts")}</h2>

          {posts.loading ? (
            <p class="text-gray-500">{t("common.loading")}</p>
          ) : posts()?.length === 0 ? (
            <p class="text-gray-500">{t("site.noPosts")}</p>
          ) : (
            <ul class="space-y-4">
              <For each={posts()}>
                {(post) => (
                  <li class="p-4 bg-white rounded-lg shadow">
                    <A
                      href={`/solid/post/${post.slug}`}
                      class="text-xl font-semibold text-blue-600 hover:underline"
                    >
                      {post.title}
                    </A>
                    {post.excerpt && <p class="text-gray-600 mt-2">{post.excerpt}</p>}
                    <p class="text-sm text-gray-400 mt-2">{formatDate(post.created_at)}</p>
                  </li>
                )}
              </For>
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
