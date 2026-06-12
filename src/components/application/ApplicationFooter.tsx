import Link from "next/link";
import Divider from "@mui/material/Divider";

const SUPPORT_EMAIL = "challenge@seedmoney.org";
const SUPPORT_SUBJECT = "SeedMoney Challenge — support request";
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  SUPPORT_SUBJECT,
)}`;

export default function ApplicationFooter() {
  return (
    <footer>
      <Divider />
      <div className="flex flex-col-reverse items-start justify-between gap-6 pt-4 text-[13px] text-[#666666] md:flex-row md:items-center md:gap-0">
        <p className="mt-4 md:mt-0">© {new Date().getFullYear()} SeedMoney All Rights Reserved.</p>
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
          <Link href="/">SeedMoney</Link>
          <Link href={SUPPORT_MAILTO}>Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
