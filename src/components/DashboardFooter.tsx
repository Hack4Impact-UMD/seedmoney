import Divider from "@mui/material/Divider";
import Link from "next/link";
export default function DashboardFooter() {
  return (
    <>
      <Divider orientation="horizontal" flexItem className = "!mt-[50px]"/>

      <footer className="border-t border-gray-200 py-5 bg-[#F6FAF9] flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 text-[14px] text-gray-500 md:hidden">
          <Link href="/">SeedMoney</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[14px] text-gray-500">
          <Link href="/">SeedMoney Challenge</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
        <p className="text-[14px] text-gray-500">© 2026 SeedMoney All Rights Reserved.</p>
      </footer>

    </>

  );
}