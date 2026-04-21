import Link from "next/link";
import Divider from "@mui/material/Divider";

export default function ApplicationFooter() {
  return (
    <footer>
      <Divider />
      <div className="flex items-center justify-between pt-6 text-[14px] text-[#666666]">
        <p>© {new Date().getFullYear()} SeedMoney All Rights Reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/">SeedMoney</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
