import { createResource, Show } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { useTranslation } from "~/lib/i18n";

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
      <header class="bg-white shadow">
        <div class="max-w-4xl mx-auto px-4 py-6">
          <h1 class="text-3xl font-bold text-gray-900">
            <A href="/solid/" class="hover:text-blue-600">
              Solid Blog
            </A>
          </h1>
          <p class="text-gray-600 mt-1">{t("site.poweredBy")}</p>
        </div>
      </header>

      <nav class="bg-gray-100 border-b">
        <div class="max-w-4xl mx-auto px-4 py-3">
          <span class="font-semibold mr-3 text-sm">{t("site.frameworkSwitch")}</span>
          <A href="/next/" class="text-blue-600 hover:underline text-sm mr-3">
            {t("framework.next")}
          </A>
          <A href="/nuxt/" class="text-green-600 hover:underline text-sm mr-3">
            {t("framework.nuxt")}
          </A>
          <A href="/svelte/" class="text-orange-600 hover:underline text-sm mr-3">
            {t("framework.svelte")}
          </A>
          <A href="/astro/" class="text-purple-600 hover:underline text-sm mr-3">
            {t("framework.astro")}
          </A>
          <span class="text-cyan-600 font-semibold text-sm">{t("framework.solid")}</span>
        </div>
      </nav>

      <main class="max-w-4xl mx-auto px-4 py-8">
        <Show when={post()} fallback={<p class="text-gray-500">{t("site.postNotExist")}</p>}>
          {(post) => (
            <article>
              <nav class="mb-4">
                <A href="/solid/" class="text-blue-600 hover:underline">
                  {t("site.backToHome")}
                </A>
              </nav>

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
