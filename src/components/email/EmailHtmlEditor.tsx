"use client";

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

interface EmailHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// Defined outside the component so CodeMirror isn't reconfigured every render
const EXTENSIONS = [html(), EditorView.lineWrapping];

export default function EmailHtmlEditor({
  value,
  onChange,
}: EmailHtmlEditorProps) {
  return (
    <CodeMirror
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
