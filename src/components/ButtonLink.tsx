"use client";

import Link from "next/link";
import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

type ButtonLinkProps = Omit<ButtonProps, "component" | "href"> & {
  href: string;
  prefetch?: boolean;
};

export default function ButtonLink({
  href,
  prefetch,
  ...buttonProps
}: ButtonLinkProps) {
  return (
    <Link href={href} prefetch={prefetch} className="inline-flex">
      <Button component="span" {...buttonProps} />
    </Link>
  );
}
