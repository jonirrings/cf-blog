import { useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

export interface JSONContent {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
}

interface RichTextEditorProps {
  initialContent?: JSONContent;
  placeholder?: string;
  inputName?: string;
  onContentChange?: (content: JSONContent) => void;
}

export function RichTextEditor({
  initialContent,
  placeholder,
  onContentChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const editorInstance = new Editor({
      element: editorRef.current,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder || 'Write something...',
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
      onUpdate: ({ editor: updatedEditor }) => {
        const jsonContent = updatedEditor.getJSON() as JSONContent;
        const hiddenInput = document.getElementById(
          'content-hidden-input'
        ) as HTMLInputElement | null;
        if (hiddenInput) {
          hiddenInput.value = JSON.stringify(jsonContent);
        }
        onContentChange?.(jsonContent);
      },
    });

    setEditor(editorInstance);

    return () => {
      editorInstance.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rich-text-editor">
      {editor && !editor.isDestroyed && (
        <div className="toolbar">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            UL
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            OL
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
          >
            &ldquo;
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
          >
            &lt;/&gt;
          </button>
        </div>
      )}
      <div ref={editorRef} className="editor-content" />
      <input
        type="hidden"
        id="content-hidden-input"
        name="content"
        defaultValue={initialContent ? JSON.stringify(initialContent) : ''}
      />
      <style>{`
        .rich-text-editor .toolbar {
          display: flex;
          gap: 2px;
          padding: 6px 8px;
          border: 1px solid #e5e7eb;
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: #f9fafb;
          flex-wrap: wrap;
        }
        .rich-text-editor .toolbar button {
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
        .rich-text-editor .toolbar button:hover {
          background: #e5e7eb;
        }
        .rich-text-editor .toolbar button.is-active {
          background: #dbeafe;
          border-color: #93c5fd;
          color: #1d4ed8;
        }
        .rich-text-editor .ProseMirror {
          outline: none;
        }
        .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .rich-text-editor .editor-content .ProseMirror {
          border: 1px solid #e5e7eb;
          border-radius: 0 0 8px 8px;
          min-height: 400px;
          padding: 16px;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
