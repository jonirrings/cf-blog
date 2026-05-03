import { Component, createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { useEditor, EditorContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useTranslation } from "~/lib/i18n";

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
  onContentChange?: (content: JSONContent) => void;
}

const RichTextEditor: Component<RichTextEditorProps> = (props) => {
  const { t } = useTranslation();
  const [editorContainer, setEditorContainer] = createSignal<HTMLDivElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: props.placeholder || t("post.contentPlaceholder"),
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: props.initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg focus:outline-none max-w-none min-h-[400px] p-4 border border-gray-200 rounded-lg",
      },
    },
    onUpdate: ({ editor }) => {
      props.onContentChange?.(editor.getJSON());
    },
  });

  onMount(() => {
    const container = editorContainer();
    if (container && editor) {
      editor.mount(container);
    }
  });

  onCleanup(() => {
    if (editor) {
      editor.destroy();
    }
  });

  createEffect(() => {
    if (props.initialContent && editor) {
      editor.commands.setContent(props.initialContent);
    }
  });

  return (
    <div class="rich-text-editor">
      <div ref={setEditorContainer} class="editor-content" />
    </div>
  );
};

export default RichTextEditor;
