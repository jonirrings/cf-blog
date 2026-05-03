import { useNavigate, useParams } from '@solidjs/router';
import { createSignal, onMount } from 'solid-js';
import RichTextEditor from '~/components/RichTextEditor';
import { useTranslation } from '~/lib/i18n';

interface JSONContent {
  type?: string;
  // biome-ignore lint/suspicious/noExplicitAny: TipTap JSON content attrs
  attrs?: Record<string, any>;
  content?: JSONContent[];
  text?: string;
  marks?: Array<{
    type: string;
    // biome-ignore lint/suspicious/noExplicitAny: TipTap JSON content attrs
    attrs?: Record<string, any>;
  }>;
}

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  framework: 'next' | 'nuxt' | 'svelte' | 'astro' | 'solid';
  status: 'draft' | 'published';
}

const EditPostPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = createSignal(false);
  const [editorContent, setEditorContent] = createSignal<JSONContent | undefined>(undefined);
  const [formData, setFormData] = createSignal<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    framework: 'solid',
    status: 'draft',
  });

  onMount(async () => {
    try {
      const res = await fetch(`/api/posts/${params.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const loadedData = data.data;
        setFormData({
          title: loadedData.title || '',
          slug: loadedData.slug || '',
          excerpt: loadedData.excerpt || '',
          content: loadedData.content || '',
          framework: loadedData.framework || 'solid',
          status: loadedData.status || 'draft',
        });
        // Parse content as JSON
        try {
          setEditorContent(JSON.parse(loadedData.content));
        } catch {
          setEditorContent({
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: loadedData.content }] }],
          });
        }
      }
    } catch (err) {
      console.error('Failed to load post:', err);
      alert(t('post.loadFailed'));
    }
  });

  const handleContentChange = (content: JSONContent) => {
    setEditorContent(content);
    setFormData({ ...formData(), content: JSON.stringify(content) });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData()),
      });

      if (res.ok) {
        navigate('/admin/posts');
      } else {
        const error = await res.json();
        alert(`${t('post.updateFailed')}: ${error.message || t('form.error')}`);
      }
    } catch (err) {
      console.error('Update post failed:', err);
      alert(t('post.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gray-100">
      <nav class="mb-6 p-4 bg-white shadow">
        <a href="/admin/posts" class="text-blue-600 hover:underline">
          ← {t('admin.back')}
        </a>
      </nav>

      <main class="max-w-4xl mx-auto p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">{t('post.edit')}</h1>

        <form onSubmit={handleSubmit} class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{t('post.title')}</label>
              <input
                type="text"
                value={formData().title}
                onInput={(e) =>
                  setFormData({ ...formData(), title: (e.target as HTMLInputElement).value })
                }
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('post.title')}
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{t('post.slug')}</label>
              <input
                type="text"
                value={formData().slug}
                onInput={(e) =>
                  setFormData({ ...formData(), slug: (e.target as HTMLInputElement).value })
                }
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('post.slugPlaceholder')}
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {t('post.excerpt')}
              </label>
              <textarea
                value={formData().excerpt}
                onInput={(e) =>
                  setFormData({ ...formData(), excerpt: (e.target as HTMLTextAreaElement).value })
                }
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('post.excerpt')}
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {t('post.framework')}
                </label>
                <select
                  value={formData().framework}
                  onChange={(e) =>
                    setFormData({
                      ...formData(),
                      framework: e.target.value as FormData['framework'],
                    })
                  }
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="next">{t('framework.next')}</option>
                  <option value="nuxt">{t('framework.nuxt')}</option>
                  <option value="svelte">{t('framework.svelte')}</option>
                  <option value="astro">{t('framework.astro')}</option>
                  <option value="solid">{t('framework.solid')}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {t('post.status')}
                </label>
                <select
                  value={formData().status}
                  onChange={(e) =>
                    setFormData({ ...formData(), status: e.target.value as FormData['status'] })
                  }
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">{t('post.status.draft')}</option>
                  <option value="published">{t('post.status.published')}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">{t('post.content')}</label>
            <RichTextEditor
              initialContent={editorContent()}
              placeholder={t('post.contentPlaceholder')}
              onContentChange={handleContentChange}
            />
            <p class="text-xs text-gray-500 mt-1">{t('post.editorTip')}</p>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              disabled={loading()}
              class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading() ? t('common.loading') : t('common.save')}
            </button>
            <a
              href="/admin/posts"
              class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            >
              {t('common.cancel')}
            </a>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditPostPage;
