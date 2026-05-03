import Link from 'next/link';
import i18n from '@cf-blog/i18n';
import { PublicNav } from '@/components/PublicNav';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  created_at: string;
}

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8788'}/api/posts`, {
      cache: 'no-store',
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
        <PublicNav />

        <section>
          <h2 className="text-2xl font-semibold mb-4">{i18n.t('site.latestPosts')}</h2>
          {posts.length === 0 ? (
            <p className="text-gray-500">{i18n.t('site.noPosts')}</p>
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
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
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
