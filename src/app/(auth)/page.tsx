"use client";

import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/src/components/LoginForm";
import LoginNavbar from "@/src/components/LoginNavbar";

export default function LoginPage() {

  return (
    <>
      <LoginNavbar />
      <div className="flex min-h-screen w-full">
        <div className="relative hidden w-1/2 lg:block">
          <Image
            src="/seedmoneyTeam.png"
            alt="Login Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex w-full lg:w-1/2 items-center justify-center">
          <div className="flex flex-col items-center gap-3 w-full max-w-[20rem]">
            <div className="self-start gap-0 mb-1">
              <h1 className="text-2xl">Welcome to SeedMoney</h1>
              <p className="text-sm text-[rgba(0,0,0,0.6)]">
                Please log in or sign up below.
              </p>
            </div>

            <LoginForm />

            <p className="text-[rgba(0,0,0,0.6)] text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#1976D2] underline font-bold">
                Sign up here
              </Link>
            </p>

            <p className="text-[rgba(0,0,0,0.6)] text-sm">
              Forgot Password / Activate Account
            </p>
          </div>
        </div>
      </div>
    </>
  );
}