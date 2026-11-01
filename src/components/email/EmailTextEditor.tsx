"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import EmailToolbar from "@/src/components/email/EmailToolbar";
import { EMAIL_EXTENSIONS } from "@/src/components/email/emailHtml";
import styles from "./EmailContent.module.css";

interface EmailTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function EmailTextEditor({
  value,
  onChange,
}: EmailTextEditorProps) {
  const editor = useEditor({
    extensions: EMAIL_EXTENSIONS,
    content: value,
    // Next.js renders on the server first; let Tiptap wait for the browser
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `${styles.content} ${styles.editor}`,
        "aria-label": "Email text",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
  });

  // Keep the editor in sync if the value changes from outside (e.g. discard)
  useEffect(() => {
    if (!editor) return;

    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <>
      {editor && <EmailToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </>
  );
}
