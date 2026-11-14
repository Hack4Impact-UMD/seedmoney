"use client";

import Link from "next/link";
import Button from "@mui/material/Button";

// On phones the two page links become small pills under the title
const PILL =
  "max-md:min-w-0! max-md:rounded-full! max-md:px-3! max-md:py-1! max-md:text-xs! max-md:normal-case! max-md:tracking-normal!";

interface EmailUsersHeaderProps {
  active: "compose" | "history";
  subtitle: string;
  sentCount?: number;
  onSentHistoryClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function EmailUsersHeader({
  active,
  subtitle,
  sentCount,
  onSentHistoryClick,
}: EmailUsersHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#123A1E] md:text-4xl">
          Email Users
        </h1>
        <p className="mt-1 text-sm text-gray-600 md:mt-2 md:text-base">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Button
          component={Link}
          href="/dashboard/email-users"
          variant={active === "compose" ? "contained" : "outlined"}
          size="small"
          className={PILL}
        >
          Compose
        </Button>

        <Button
          component={Link}
          href="/dashboard/email-users/sent-history"
          onClick={onSentHistoryClick}
          variant={active === "history" ? "contained" : "outlined"}
          size="small"
          className={PILL}
        >
          Sent history{sentCount === undefined ? "" : ` (${sentCount.toLocaleString()})`}
        </Button>
      </div>
    </div>
  );
}
