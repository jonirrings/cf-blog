import { createResource, Show } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { useTranslation } from "~/lib/i18n";
import { PublicNav } from "~/components/PublicNav";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  created_at: string;
  updated_at: string;
}

async function fetchPost(slug: string): Promise<Post | null> {
  const api_url = import.meta.env.PUBLIC_API_URL || "http://localhost:8788";
  const res = await fetch(`${api_url}/api/posts/${slug}`);
  if (!res.ok) return null;
  const { data } = await res.json();
  return data || null;
}

export default function PostPage() {
  const { t, locale } = useTranslation();
  const params = useParams();
  const [post] = createResource(() => params.slug, fetchPost);

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(locale() === "zh-CN" ? "zh-CN" : "en");
  }

  return (
    <div class="min-h-screen">
      <PublicNav />

      <main class="max-w-4xl mx-auto px-4 py-8">
        <Show when={post()} fallback={<p class="text-gray-500">{t("site.postNotExist")}</p>}>
          {(post) => (
            <article>
              <header class="mb-8">
                <h1 class="text-4xl font-bold mb-2 text-gray-900">{post().title}</h1>
                <div class="text-sm text-gray-500 space-x-4">
                  <span>
                    {t("site.publishedAt")} {formatDate(post().created_at)}
                  </span>
                  {post().updated_at !== post().created_at && (
                    <span>
                      {t("site.updatedAt")} {formatDate(post().updated_at)}
                    </span>
                  )}
                </div>
              </header>

              <Show when={post().excerpt}>
                <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p class="text-gray-700 italic">{post().excerpt}</p>
                </div>
              </Show>

              <div class="prose prose-lg max-w-none" innerHTML={post().content} />
            </article>
          )}
        </Show>
      </main>
    </div>
  );
}
