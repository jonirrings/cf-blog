<template>
  <div class="rich-text-editor">
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, defineProps, defineEmits } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

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

const props = defineProps<{
  initialContent?: JSONContent;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'contentChange', content: JSONContent): void;
}>();

const { t } = useI18n();

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder || t('post.contentPlaceholder'),
    }),
    Image.configure({
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
  ],
  content: props.initialContent,
  immediatelyRender: false,
  editorProps: {
    attributes: {
      class:
        'prose prose-lg focus:outline-none max-w-none min-h-[400px] p-4 border border-gray-200 rounded-lg',
    },
  },
  onUpdate: ({ editor }) => {
    emit('contentChange', editor.getJSON());
  },
});

watch(
  () => props.initialContent,
  (newContent) => {
    if (editor.value && newContent) {
      editor.value.commands.setContent(newContent);
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.rich-text-editor :deep(.editor-content) {
  width: 100%;
}

.rich-text-editor :deep(.ProseMirror) {
  outline: none;
}

.rich-text-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
