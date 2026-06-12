import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { Button, Typography } from "@mui/material";

const SUPPORT_EMAIL = "challenge@seedmoney.org";
const SUPPORT_SUBJECT = "SeedMoney Challenge — support request";
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  SUPPORT_SUBJECT,
)}`;

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

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button
          component="a"
          href={SUPPORT_MAILTO}
          variant="contained"
          size="medium"
          startIcon={<EmailOutlinedIcon fontSize="small" />}
        >
          Contact Support
        </Button>

        <Typography
          component="span"
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
            lineHeight: 1.5,
          }}
        >
          {SUPPORT_EMAIL}
        </Typography>
      </div>
    </section>
  );
}
