import { useNavigate } from '@solidjs/router';
import { type Component, createSignal } from 'solid-js';
import RichTextEditor from '~/components/RichTextEditor';
import { useTranslation } from '~/lib/i18n';

interface JSONContent {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
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

const NewPostPage: Component = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = createSignal(false);
  const [formData, setFormData] = createSignal<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    framework: 'solid',
    status: 'draft',
  });

  const handleTitleChange = (e: Event) => {
    const title = (e.target as HTMLInputElement).value;
    setFormData({ ...formData(), title });
    // Auto-generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .trim();
    setFormData({ ...formData(), slug });
  };

  const handleContentChange = (content: JSONContent) => {
    setFormData({ ...formData(), content: JSON.stringify(content) });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData()),
      });

      if (res.ok) {
        navigate('/solid/admin/posts');
      } else {
        const error = await res.json();
        alert(`${t('post.createFailed')}: ${error.message || t('form.error')}`);
      }
    } catch (err) {
      console.error('Create post failed:', err);
      alert(t('post.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{t('post.createPost')}</h1>

      <form onSubmit={handleSubmit} class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{t('post.title')}</label>
            <input
              type="text"
              value={formData().title}
              onInput={handleTitleChange}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('post.titlePlaceholder')}
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
            <label class="block text-sm font-medium text-gray-700 mb-1">{t('post.excerpt')}</label>
            <textarea
              value={formData().excerpt}
              onInput={(e) =>
                setFormData({ ...formData(), excerpt: (e.target as HTMLTextAreaElement).value })
              }
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('post.excerptPlaceholder')}
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
                  setFormData({ ...formData(), framework: e.target.value as FormData['framework'] })
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
              <label class="block text-sm font-medium text-gray-700 mb-1">{t('post.status')}</label>
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
            {loading() ? t('post.saving') : t('post.publishPost')}
          </button>
          <a
            href="/solid/admin/posts"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
          >
            {t('common.cancel')}
          </a>
        </div>
      </form>
    </>
  );
};

export default NewPostPage;
