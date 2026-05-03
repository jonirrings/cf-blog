<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { t } from '$lib/i18n';
  import { useEditor, EditorContent } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Placeholder from '@tiptap/extension-placeholder';
  import Image from '@tiptap/extension-image';
  import Link from '@tiptap/extension-link';

  export interface JSONContent {
    type?: string;
    attrs?: Record<string, any>;
    content?: JSONContent[];
    text?: string;
    marks?: Array<{
      type: string;
      attrs?: Record<string, any>;
    }>;
  }

  export let initialContent: JSONContent | undefined = undefined;
  export let placeholder = t('post.contentPlaceholder');

  const dispatch = createEventDispatcher<{
    contentChange: JSONContent;
  }>();

  let editorContainer: HTMLDivElement;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
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
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none min-h-[400px] p-4 border border-gray-200 rounded-lg',
      },
    },
    onUpdate: ({ editor }) => {
      dispatch('contentChange', editor.getJSON());
    },
  });

  onMount(() => {
    if (editorContainer && editor) {
      editor.mount(editorContainer);
    }
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  $: if (initialContent && editor) {
    editor.commands.setContent(initialContent);
  }
</script>

<div class="rich-text-editor">
  <div bind:this={editorContainer} class="editor-content" />
</div>

<style>
  .rich-text-editor :global(.editor-content) {
    width: 100%;
  }

  .rich-text-editor :global(.ProseMirror) {
    outline: none;
  }

  .rich-text-editor :global(.ProseMirror p.is-editor-empty:first-child::before) {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
</style>
