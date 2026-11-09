"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import CodeMirror, {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  type DecorationSet,
  type ReactCodeMirrorRef,
  type ViewUpdate,
} from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import type { EmailEditorHandle } from "@/src/components/email/EmailEditor";
import { tokenPattern } from "@/src/components/email/emailTokens";

interface EmailHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
  ref?: Ref<EmailEditorHandle>;
}

// Code colors from the design: green tags, orange attributes, blue values
const emailHighlightStyle = HighlightStyle.define([
  { tag: [tags.tagName, tags.angleBracket], color: "#2d7a45" },
  { tag: tags.attributeName, color: "#b5651d" },
  { tag: tags.attributeValue, color: "#2a6fa8" },
  { tag: tags.comment, color: "#8e938e", fontStyle: "italic" },
]);

const emailTheme = EditorView.theme({
  "&": { fontSize: "13px", color: "#1f2320" },
  "&.cm-focused": { outline: "none" },
  ".cm-content": {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    padding: "16px 0",
    lineHeight: "1.7",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "#b0b5b0",
    paddingLeft: "12px",
  },
  ".cm-lineNumbers .cm-gutterElement": { paddingRight: "16px" },
  ".cm-email-token": { color: "#b5651d !important", fontWeight: "700" },
});

// Shows {{first_name}} etc. in bold orange, including inside attribute values
const tokenMatcher = new MatchDecorator({
  regexp: tokenPattern(),
  decoration: Decoration.mark({ class: "cm-email-token" }),
});

const tokenHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = tokenMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.decorations = tokenMatcher.updateDeco(update, this.decorations);
    }
  },
  { decorations: (plugin) => plugin.decorations },
);

// Defined outside the component so CodeMirror isn't reconfigured every render
const EXTENSIONS = [
  html(),
  EditorView.lineWrapping,
  syntaxHighlighting(emailHighlightStyle),
  emailTheme,
  tokenHighlighter,
];

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
      basicSetup={{
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        // Our colors replace the default syntax colors
        syntaxHighlighting: false,
      }}
      aria-label="Email HTML"
    />
  );
}
