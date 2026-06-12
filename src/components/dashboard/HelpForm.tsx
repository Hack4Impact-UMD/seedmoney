import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { Button, Typography } from "@mui/material";
import Link from "next/link";

const SUPPORT_EMAIL = "challenge@seedmoney.org";

export default function HelpForm() {
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
        Need Help?
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
        Questions about your campaign or account? Send us an email and
        we&apos;ll get back to you as soon as we can.
      </Typography>

      <Button
        component="a"
        href={`mailto:${SUPPORT_EMAIL}`}
        variant="contained"
        size="medium"
        startIcon={<EmailOutlinedIcon fontSize="small" />}
      >
        Contact Support
      </Button>

      <Typography
        sx={{
          color: "text.secondary",
          fontSize: "1rem",
          lineHeight: 1.5,
          mt: 2.5,
        }}
      >
        Or email{" "}
        <Link
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-bold text-inherit no-underline"
        >
          {SUPPORT_EMAIL}
        </Link>
      </Typography>
    </section>
  );
}
