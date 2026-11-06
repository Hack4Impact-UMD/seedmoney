"use client";

import clsx from "clsx";
import { Code, TextFields } from "@mui/icons-material";

export type EmailFormatTab = "text" | "html";

interface EmailFormatTabsProps {
  activeTab: EmailFormatTab;
  onChange: (tab: EmailFormatTab) => void;
}

const TABS: { value: EmailFormatTab; label: string; Icon: typeof Code }[] = [
  { value: "text", label: "Text", Icon: TextFields },
  { value: "html", label: "HTML", Icon: Code },
];

export default function EmailFormatTabs({
  activeTab,
  onChange,
}: EmailFormatTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Email format"
      className="flex gap-1 border-b border-gray-300 bg-[#F6FAF9] px-2 pt-2"
    >
      {TABS.map(({ value, label, Icon }) => {
        const isActive = activeTab === value;

        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={clsx(
              "-mb-px flex items-center gap-1.5 rounded-t-md border px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "border-gray-300 border-b-white bg-white font-semibold text-[#123A1E]"
                : "cursor-pointer border-transparent text-gray-500 hover:text-[#123A1E]",
            )}
          >
            <Icon sx={{ fontSize: 16 }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
