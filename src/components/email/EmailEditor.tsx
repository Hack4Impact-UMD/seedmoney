"use client";

import { useState, type Ref } from "react";
import Button from "@mui/material/Button";
import BaseModal from "@/src/components/bases/BaseModal";
import EmailFormatTabs, {
  type EmailFormatTab,
} from "@/src/components/email/EmailFormatTabs";
import EmailHtmlEditor from "@/src/components/email/EmailHtmlEditor";
import EmailTextEditor from "@/src/components/email/EmailTextEditor";
import {
  findUnsupportedFormatting,
  normalizeEmailHtml,
} from "@/src/components/email/emailHtml";

// Lets the page insert content at the cursor of whichever tab is open
export interface EmailEditorHandle {
  insertImage: (src: string, alt: string) => void;
}

interface EmailEditorProps {
  value: string;
  onChange: (html: string) => void;
  ref?: Ref<EmailEditorHandle>;
}

export default function EmailEditor({
  value,
  onChange,
  ref,
}: EmailEditorProps) {
  const [activeTab, setActiveTab] = useState<EmailFormatTab>("text");
  // Formatting that would be lost; non-null while the warning is open
  const [pendingRemovals, setPendingRemovals] = useState<string[] | null>(
    null,
  );

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
      <EmailFormatTabs activeTab={activeTab} onChange={handleTabChange} />

      {activeTab === "html" ? (
        <EmailHtmlEditor ref={ref} value={value} onChange={onChange} />
      ) : (
        <EmailTextEditor ref={ref} value={value} onChange={onChange} />
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
