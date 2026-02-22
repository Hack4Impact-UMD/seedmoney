import logo from "../public/logoWithText.png";
import Link from "next/link";
import Image from "next/image";

export default function LoginNavbar() {
  return (
    <div className="fixed top-0 left-0 z-50 w-full">
      <nav className="w-full bg-[#333333] text-white">
        <div className="flex justify-between px-4 h-14">
          {/*logo */}
          <a href="/" className="flex items-center">
            <Image
              src={logo.src}
              alt="SeedMoney Logo"
              className="h-8 select-none"
              draggable={false}
              priority
            />
          </a>
          {/* auth links */}
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/signup"
              className="text-white transition hover:underline"
            >
              Sign Up
            </Link>
            <Link href="/" className="text-white transition hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
