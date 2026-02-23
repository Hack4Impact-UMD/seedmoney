"use client";

import Link from "next/link";
import Image from "next/image";
import seedMoneyTeam from "../../public/seedmoneyTeam.png";
import SignupForm from "@/src/components/SignupForm";
import LoginNavbar from "@/src/components/LoginNavbar";

export default function SignupPage() {
  return (
    <>
      <LoginNavbar />
      <main>
        <div className="flex min-h-screen w-full">

          {/* LEFT IMAGE */}
          <div className="relative hidden w-1/2 xl:block">
            <Image
              src={seedMoneyTeam}
              alt="Signup Background"
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex w-full xl:w-1/2 items-center justify-center">
            <div className="flex flex-col items-center gap-3 w-full max-w-[20rem]">

              <div className="self-start mb-1">
                <h1 className="text-2xl">
                  New to SeedMoney?
                </h1>

                <p className="text-sm text-[rgba(0,0,0,0.6)]">
                  Create an account so you can get started setting up your fundraising campaign.
                </p>
              </div>

              <SignupForm />

              <p className="text-[rgba(0,0,0,0.6)] text-sm">
                Already have an account?{" "}
                <Link
                  href="/"
                  className="text-[#1976D2] underline font-bold"
                >
                  Log in here
                </Link>
              </p>

            </div>
          </div>

        </div>
      </main>

    </>

  );
}