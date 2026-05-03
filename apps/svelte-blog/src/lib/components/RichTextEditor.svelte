<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { t } from '$lib/i18n';
import { Editor } from '@tiptap/core';
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

let {
  initialContent,
  placeholder = t('post.contentPlaceholder'),
  onContentChange,
}: {
  initialContent?: JSONContent;
  placeholder?: string;
  onContentChange?: (content: JSONContent) => void;
} = $props();

let element: HTMLDivElement | undefined = $state();
let editorState = $state<{ editor: Editor | null }>({ editor: null });

onMount(() => {
  if (!element) return;

  const editor = new Editor({
    element,
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
        class:
          'prose prose-lg focus:outline-none max-w-none min-h-[400px] p-4 border border-gray-200 rounded-lg',
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getJSON() as JSONContent);
    },
    onTransaction: () => {
      editorState = { editor };
    },
  });

  editorState = { editor };
});

onDestroy(() => {
  editorState.editor?.destroy();
});

$effect(() => {
  if (initialContent && editorState.editor && !editorState.editor.isDestroyed) {
    editorState.editor.commands.setContent(initialContent);
  }
});
</script>

<div class="rich-text-editor">
  {#if editorState.editor}
    <div class="toolbar">
      <button
        onclick={() => editorState.editor!.chain().focus().toggleBold().run()}
        class:active={editorState.editor.isActive('bold')}
        type="button"
      >
        <strong>B</strong>
      </button>
      <button
        onclick={() => editorState.editor!.chain().focus().toggleItalic().run()}
        class:active={editorState.editor.isActive('italic')}
        type="button"
      >
        <em>I</em>
      </button>
      <button
        onclick={() => editorState.editor!.chain().focus().toggleHeading({ level: 2 }).run()}
        class:active={editorState.editor.isActive('heading', { level: 2 })}
        type="button"
      >
        H2
      </button>
      <button
        onclick={() => editorState.editor!.chain().focus().toggleHeading({ level: 3 }).run()}
        class:active={editorState.editor.isActive('heading', { level: 3 })}
        type="button"
      >
        H3
      </button>
      <button
        onclick={() => editorState.editor!.chain().focus().toggleBulletList().run()}
        class:active={editorState.editor.isActive('bulletList')}
        type="button"
      >
        UL
      </button>
      <button
        onclick={() => editorState.editor!.chain().focus().toggleOrderedList().run()}
        class:active={editorState.editor.isActive('orderedList')}
        type="button"
      >
        OL
      </button>
      <button
        onclick={() => editorState.editor!.chain().focus().toggleBlockquote().run()}
        class:active={editorState.editor.isActive('blockquote')}
        type="button"
      >
        &ldquo;
      </button>
      <button
        onclick={() => editorState.editor!.chain().focus().toggleCodeBlock().run()}
        class:active={editorState.editor.isActive('codeBlock')}
        type="button"
      >
        &lt;/&gt;
      </button>
    </div>
  {/if}
  <div bind:this={element} class="editor-content"></div>
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

  .toolbar {
    display: flex;
    gap: 2px;
    padding: 6px 8px;
    border: 1px solid #e5e7eb;
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    background: #f9fafb;
    flex-wrap: wrap;
  }

  .toolbar button {
    padding: 4px 8px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    color: #374151;
    min-width: 32px;
    text-align: center;
  }

  .toolbar button:hover {
    background: #e5e7eb;
  }

  .toolbar button.active {
    background: #dbeafe;
    border-color: #93c5fd;
    color: #1d4ed8;
  }

  .rich-text-editor :global(.editor-content .ProseMirror) {
    border: 1px solid #e5e7eb;
    border-radius: 0 0 8px 8px;
    min-height: 400px;
    padding: 16px;
  }
</style>
