"use client";

import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@/src/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface Props {
  session?: Session | null;
}

export default function LoginNavbar({ session = null }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="w-full">
      <nav className="w-full bg-[#333333] text-white">
        <div className="flex justify-between px-4 h-14">
          {/*logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logoWithText.png"
              alt="SeedMoney Logo"
              width={160}
              height={32}
              className="h-8 w-auto select-none"
              draggable={false}
              priority
            />
          </Link>
          {/* auth links */}
          <div className="flex items-center gap-6 text-sm font-medium">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white transition hover:underline"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white transition hover:underline"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>

                <Link
                  href="/how-it-works"
                  className="text-white transition hover:underline"
                >
                  How it works
                </Link>

                <Link
                  href="/signup"
                  className="text-white transition hover:underline"
                >
                  Sign Up
                </Link>

                <Link
                  href="/"
                  className="text-white transition hover:underline"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
