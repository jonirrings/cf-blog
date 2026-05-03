import Link from "next/link";
import { notFound } from "next/navigation";
import i18n from "@cf-blog/i18n";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  created_at: string;
  updated_at: string;
  author_id: number;
}

interface PostParams {
  params: {
    slug: string;
  };
}

// 静态生成参数 - 构建时生成所有文章页面
export async function generateStaticParams() {
  // 由于是静态导出，我们返回空数组
  // 实际使用时需要从 API 获取文章列表
  return [];
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${process.env.API_URL || "http://localhost:8788"}/api/posts/slug/${slug}`,
      { cache: "no-store" },
    );
    if (!res.ok) {
      return null;
    }
    const { data } = await res.json();
    return data || null;
  } catch {
    return null;
  }
}

export default async function PostPage({ params }: PostParams) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <article className="max-w-4xl mx-auto">
        <nav className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">
            {i18n.t("site.backToHome")}
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
          <div className="text-sm text-gray-500 space-x-4">
            <span>
              {i18n.t("site.publishedAt")} {new Date(post.created_at).toLocaleDateString("zh-CN")}
            </span>
            {post.updated_at !== post.created_at && (
              <span>
                {i18n.t("site.updatedAt")} {new Date(post.updated_at).toLocaleDateString("zh-CN")}
              </span>
            )}
          </div>
        </header>

        {post.excerpt && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 italic">{post.excerpt}</p>
          </div>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}
