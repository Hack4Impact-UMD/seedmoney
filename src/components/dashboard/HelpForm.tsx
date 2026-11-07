import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Button, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";
import {
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
} from "@/src/constants/emailConstants";

const buttonSx = {
  minWidth: { sm: "18rem" },
  fontSize: { xs: "1.125rem", sm: "1.25rem" },
  py: 1.5,
  px: 4,
  "& .MuiButton-endIcon > *:nth-of-type(1)": { fontSize: "1.5rem" },
};

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
        Many common questions from donors and campaign leaders are answered in
        the FAQ. If you have a question or request about your campaign or
        account, use the Contact Support button to message us.
      </Typography>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-10">
        <Button
          component={Link}
          href="/faq"
          variant="contained"
          size="large"
          endIcon={<OpenInNewIcon />}
          sx={buttonSx}
        >
          View the full FAQ
        </Button>

        <Button
          component="a"
          href={SUPPORT_MAILTO}
          variant="contained"
          size="large"
          endIcon={<EmailOutlinedIcon />}
          sx={buttonSx}
        >
          Contact Support
        </Button>
      </div>

      <Typography
        sx={{
          color: "text.secondary",
          fontSize: "1rem",
          lineHeight: 1.5,
          mt: 3,
        }}
      >
        Or email{" "}
        <MuiLink
          href={SUPPORT_MAILTO}
          underline="hover"
          sx={{ color: "primary.main", wordBreak: "break-all" }}
        >
          {SUPPORT_EMAIL}
        </MuiLink>
      </Typography>
    </section>
  );
}
