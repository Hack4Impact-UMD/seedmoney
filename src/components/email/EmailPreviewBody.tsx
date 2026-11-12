"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import styles from "./EmailContent.module.css";

interface EmailPreviewBodyProps {
  html: string;
}

export default function EmailPreviewBody({ html }: EmailPreviewBodyProps) {
  // The HTML is typed by an admin, so strip anything that could run code
  // (<script>, onerror=, javascript: links) before putting it on the page
  const safeHtml = useMemo(() => DOMPurify.sanitize(html), [html]);

  if (!safeHtml.trim()) {
    return <p className="text-gray-400">No message yet</p>;
  }

  return (
    <div
      className={styles.content}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
