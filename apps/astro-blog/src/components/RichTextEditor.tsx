import { Component } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import i18n from '@cf-blog/i18n';

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

interface RichTextEditorProps {
  initialContent?: JSONContent;
  placeholder?: string;
  inputName?: string;
  onContentChange?: (content: JSONContent) => void;
}

export const RichTextEditor: Component<RichTextEditorProps> = (props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: props.placeholder || i18n.t('post.contentPlaceholder'),
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
    editorProps: {
      attributes: {
        class:
          'prose prose-lg focus:outline-none max-w-none min-h-[400px] p-4 border border-gray-200 rounded-lg',
      },
    },
    onUpdate: ({ editor }) => {
      const jsonContent = editor.getJSON();
      // Store in hidden input for form submission
      const hiddenInput = document.getElementById('content-hidden-input') as HTMLInputElement;
      if (hiddenInput) {
        hiddenInput.value = JSON.stringify(jsonContent);
      }
      props.onContentChange?.(jsonContent);
    },
  });

  return (
    <div className="rich-text-editor">
      <EditorContent editor={editor} className="editor-content" />
      <input
        type="hidden"
        id="content-hidden-input"
        name="content"
        value={props.initialContent ? JSON.stringify(props.initialContent) : ''}
      />
    </div>
  );
};

export default RichTextEditor;
