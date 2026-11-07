"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import CodeMirror, {
  EditorView,
  type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import type { EmailEditorHandle } from "@/src/components/email/EmailEditor";

interface EmailHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
  ref?: Ref<EmailEditorHandle>;
}

// Defined outside the component so CodeMirror isn't reconfigured every render
const EXTENSIONS = [html(), EditorView.lineWrapping];

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export default function EmailHtmlEditor({
  value,
  onChange,
  ref,
}: EmailHtmlEditorProps) {
  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);

  useImperativeHandle(ref, () => ({
    insertImage: (src, alt) => {
      const view = codeMirrorRef.current?.view;
      if (!view) return;

      // Replaces the selection (or inserts at the cursor) and fires onChange
      view.dispatch(
        view.state.replaceSelection(
          `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}">`,
        ),
      );
      view.focus();
    },
  }));

  return (
    <CodeMirror
      ref={codeMirrorRef}
      value={value}
      onChange={onChange}
      extensions={EXTENSIONS}
      theme="light"
      minHeight="400px"
      basicSetup={{ foldGutter: false, highlightActiveLine: false }}
      aria-label="Email HTML"
      className="text-sm"
    />
  );
}
