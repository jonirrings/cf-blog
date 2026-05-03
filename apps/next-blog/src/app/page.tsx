import Link from "next/link";
import i18n from "@cf-blog/i18n";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  created_at: string;
}

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${process.env.API_URL || "http://localhost:8788"}/api/posts`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return [];
    }
    const { data } = await res.json();
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Next.js Blog</h1>
          <p className="text-gray-600">{i18n.t("site.poweredBy")}</p>
        </header>

        <nav className="mb-8 p-4 bg-gray-100 rounded-lg">
          <span className="font-semibold mr-4">{i18n.t("site.frameworkSwitch")}</span>
          <a href="/next/" className="text-blue-600 hover:underline mr-4">
            {i18n.t("framework.next")}
          </a>
          <a href="/nuxt/" className="text-green-600 hover:underline mr-4">
            {i18n.t("framework.nuxt")}
          </a>
          <a href="/svelte/" className="text-orange-600 hover:underline">
            {i18n.t("framework.svelte")}
          </a>
        </nav>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{i18n.t("site.latestPosts")}</h2>
          {posts.length === 0 ? (
            <p className="text-gray-500">{i18n.t("site.noPosts")}</p>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id} className="p-4 bg-white rounded-lg shadow">
                  <Link
                    href={`/post/${post.slug}`}
                    className="text-xl font-semibold text-blue-600 hover:underline"
                  >
                    {post.title}
                  </Link>
                  {post.excerpt && <p className="text-gray-600 mt-2">{post.excerpt}</p>}
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(post.created_at).toLocaleDateString("zh-CN")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
