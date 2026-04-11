import Divider from "@mui/material/Divider";
import Link from "next/link";
export default function DashboardFooter() {
  return (
    <>
      <Divider orientation="horizontal" flexItem className = "!mt-[50px]"/>

      <footer className="border-t border-gray-200 py-5 flex items-center justify-between bg-[#F6FAF9]">
        <p className="text-[14px] text-gray-500">© 2026 SeedMoney All Rights Reserved.</p>
        <div className="flex items-center gap-6 text-[14px] text-gray-500">

          <Link href="/">SeedMoney Challenge</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </footer>

    </>

  );
}