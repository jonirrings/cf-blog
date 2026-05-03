<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="mb-6 p-4 bg-white shadow">
      <a href="/admin/posts" class="text-blue-600 hover:underline">← 返回文章列表</a>
    </nav>

    <main class="max-w-7xl mx-auto p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t("post.edit") }}</h1>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("post.title") }}
            </label>
            <input
              v-model="formData.title"
              type="text"
              id="title"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("post.slug") }}
            </label>
            <input
              v-model="formData.slug"
              type="text"
              id="slug"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label for="excerpt" class="block text-sm font-medium text-gray-700 mb-1">
              {{ t("post.excerpt") }}
            </label>
            <textarea
              v-model="formData.excerpt"
              id="excerpt"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="framework" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t("post.framework") }}
              </label>
              <select
                v-model="formData.framework"
                id="framework"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="next">{{ t("framework.next") }}</option>
                <option value="nuxt">{{ t("framework.nuxt") }}</option>
                <option value="svelte">{{ t("framework.svelte") }}</option>
                <option value="astro">{{ t("framework.astro") }}</option>
                <option value="solid">{{ t("framework.solid") }}</option>
              </select>
            </div>

            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t("post.status") }}
              </label>
              <select
                v-model="formData.status"
                id="status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">{{ t("post.status.draft") }}</option>
                <option value="published">{{ t("post.status.published") }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t("post.content") }}
          </label>
          <RichTextEditor
            :initial-content="editorContent"
            :placeholder="t('post.contentPlaceholder')"
            @content-change="handleContentChange"
          />
          <p class="text-xs text-gray-500 mt-1">{{ t("post.editorTip") }}</p>
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? t("common.loading") : t("common.save") }}
          </button>
          <a
            href="/admin/posts"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
          >
            {{ t("common.cancel") }}
          </a>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const postId = route.params.id as string;

interface JSONContent {
  type?: string;
  attrs?: Record<string, any>;
  content?: JSONContent[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
}

const formData = ref({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  framework: "next" as "next" | "nuxt" | "svelte" | "astro" | "solid",
  status: "draft" as "draft" | "published",
});

const editorContent = ref<JSONContent | undefined>(undefined);
const saving = ref(false);
const loading = ref(true);

// 加载文章数据
onMounted(async () => {
  try {
    const res = await $fetch(`/api/posts/${postId}`);
    const { data } = await res.json();
    if (data) {
      formData.value = {
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        framework: data.framework || "nuxt",
        status: data.status || "draft",
      };
      // 解析内容为 JSON
      try {
        editorContent.value = JSON.parse(data.content);
      } catch {
        // 如果不是 JSON，使用默认内容
        editorContent.value = {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: data.content }] }],
        };
      }
    }
  } catch (err) {
    console.error("Failed to load post:", err);
    alert(t("post.loadFailed"));
  } finally {
    loading.value = false;
  }
});

function handleContentChange(content: JSONContent) {
  editorContent.value = content;
  formData.value.content = JSON.stringify(content);
}

const handleSubmit = async () => {
  saving.value = true;
  try {
    await $fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: formData.value,
    });
    router.push("/admin/posts");
  } catch (error) {
    alert(t("post.updateFailed"));
  } finally {
    saving.value = false;
  }
};
</script>
