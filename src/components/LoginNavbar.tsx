import logo from "../public/logoWithText.png";
import Link from "next/link";
import Image from "next/image";

export default function LoginNavbar() {
  return (
    <div className="w-full">
      <nav className="w-full bg-[#333333] text-white">
        <div className="flex justify-between px-4 h-14">
          {/*logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="SeedMoney Logo"
              className="h-8 w-auto select-none"
              draggable={false}
              priority
            />
          </Link>
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
