"use client";

import { useImperativeHandle, useRef, useState, type Ref } from "react";
import Button from "@mui/material/Button";
import BaseModal from "@/src/components/bases/BaseModal";
import EmailFormatTabs, {
  type EmailFormatTab,
} from "@/src/components/email/EmailFormatTabs";
import EmailHtmlEditor from "@/src/components/email/EmailHtmlEditor";
import EmailTextEditor from "@/src/components/email/EmailTextEditor";
import EmailTokenMenu from "@/src/components/email/EmailTokenMenu";
import type { EmailTokenKey } from "@/src/components/email/emailTokens";
import {
  findUnsupportedFormatting,
  normalizeEmailHtml,
} from "@/src/components/email/emailHtml";

// Lets the page insert content at the cursor of whichever tab is open
export interface EmailEditorHandle {
  insertImage: (src: string, alt: string) => void;
  insertToken: (key: EmailTokenKey) => void;
}

interface EmailEditorProps {
  value: string;
  onChange: (html: string) => void;
  ref?: Ref<EmailEditorHandle>;
  initialFormat?: EmailFormatTab;
}

export default function EmailEditor({
  value,
  onChange,
  ref,
  initialFormat = "text",
}: EmailEditorProps) {
  const [activeTab, setActiveTab] = useState<EmailFormatTab>(initialFormat);
  // Formatting that would be lost; non-null while the warning is open
  const [pendingRemovals, setPendingRemovals] = useState<string[] | null>(
    null,
  );

  // The open tab's editor; the page reaches it through the same handle
  const tabRef = useRef<EmailEditorHandle>(null);
  useImperativeHandle(ref, () => ({
    insertImage: (src, alt) => tabRef.current?.insertImage(src, alt),
    insertToken: (key) => tabRef.current?.insertToken(key),
  }));

  const switchToText = () => {
    // Store what the Text tab shows, so the email matches what Roger sees
    onChange(normalizeEmailHtml(value));
    setActiveTab("text");
    setPendingRemovals(null);
  };

  const handleTabChange = (tab: EmailFormatTab) => {
    if (tab === activeTab) return;

    if (tab === "text") {
      const removals = findUnsupportedFormatting(value);
      if (removals.length > 0) {
        setPendingRemovals(removals);
        return;
      }
      switchToText();
      return;
    }

    setActiveTab(tab);
  };

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-300">
      <EmailFormatTabs activeTab={activeTab} onChange={handleTabChange}>
        {/* Phones keep Insert token beside the tabs. On desktop the Text tab
            has it in the toolbar, so only the HTML tab needs it here. */}
        <EmailTokenMenu
          className={activeTab === "text" ? "md:hidden!" : undefined}
          onInsert={(key) => tabRef.current?.insertToken(key)}
        />
      </EmailFormatTabs>

      {activeTab === "html" ? (
        <EmailHtmlEditor ref={tabRef} value={value} onChange={onChange} />
      ) : (
        <EmailTextEditor ref={tabRef} value={value} onChange={onChange} />
      )}

      <BaseModal
        open={pendingRemovals !== null}
        onClose={() => setPendingRemovals(null)}
        title="Remove unsupported formatting?"
      >
        <p className="text-[#666666] !text-[16px]">
          The Text tab only supports basic formatting. Switching will remove:
        </p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {pendingRemovals?.map((item) => (
            <li
              key={item}
              className="rounded bg-gray-100 px-2 py-0.5 font-mono text-sm text-gray-700"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-row mt-5 w-full justify-end">
          <Button
            variant="outlined"
            size="small"
            className="mt-4 !border-none !text-[#666666]"
            onClick={() => setPendingRemovals(null)}
          >
            Stay on HTML
          </Button>

          <Button
            variant="contained"
            size="small"
            className="mt-4 !ml-3"
            onClick={switchToText}
          >
            Switch and remove
          </Button>
        </div>
      </BaseModal>
    </div>
  );
}
