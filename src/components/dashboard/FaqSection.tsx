"use client";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Button, Typography } from "@mui/material";
import Link from "next/link";

export default function FaqSection() {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <Typography
        variant="h2"
        sx={{
          color: "text.primary",
          fontSize: { xs: "1.375rem", sm: "1.5rem" },
          fontWeight: 700,
          lineHeight: 1.2,
          mb: 1.5,
        }}
      >
        Frequently Asked Questions
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          fontSize: { xs: "1rem", sm: "1.125rem" },
          lineHeight: 1.45,
          mb: 3,
          maxWidth: "58rem",
        }}
      >
        Find answers about grants, funding, deadlines, acknowledging donations,
        and managing your campaign on the full FAQ page.
      </Typography>

      <Button
        component={Link}
        href="/faq"
        variant="contained"
        size="medium"
        endIcon={<OpenInNewIcon fontSize="small" />}
      >
        View the full FAQ
      </Button>
    </section>
  );
}
