'use client';

import i18n from '@cf-blog/i18n';
import type { JSONContent } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface EditorProps {
  initialContent?: JSONContent;
  onContentChange?: (content: JSONContent) => void;
  placeholder?: string;
}

export default function Editor({ initialContent, onContentChange, placeholder }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || i18n.t('post.contentPlaceholder'),
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
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-lg focus:outline-none max-w-none min-h-[400px] p-4 border border-gray-200 rounded-lg',
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getJSON());
    },
  });

  return (
    <div>
      <EditorContent editor={editor} />
    </div>
  );
}
