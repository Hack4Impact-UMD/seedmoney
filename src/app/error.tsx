"use client"; //used reset and onClick so we need this line

import { Button } from "@mui/material";
import Image from "next/image"; //next's better image component
import Link from "next/link"; //next's client side nav

//define shape of props passed in
type ErrorProps = {
  error: Error & { digest?: string }; //must be error obj but can include digest if provided by next
  reset: () => void; //retry after rendering error
};

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6FAF9]">
      <div className="flex flex-col items-center">
        {/*seedmoney logo*/}
        <div className="w-36 h-36 mb-8 rounded-full bg-white border-[3px] border-[#008832] flex items-center justify-center">
          <div className="relative w-[92px] h-[92px] translate-y-[3px]">
            <Image
              src="/seedMoneyLogo.png"
              alt="Logo"
              fill
              className="object-contain object-center block"
            />
          </div>
        </div>

        <h1 className="text-center text-[36px] leading-[42px] tracking-[0.12px] font-semibold text-[#008832]">
          Oops! Something went
          <br />
          wrong
        </h1>

        <p className="mt-4 text-center text-[19px] leading-[28px] tracking-[-0.1px] font-normal text-[#008832]">
          We&apos;re having trouble loading this page. Please try again.
        </p>

        {/*! in front of tailwind code makes it override MUI default styling*/}
        <div className="mt-9 flex items-center gap-4">
          <Button
            component={Link}
            href="/" //home page
            disableElevation //remove default MUI effects
            className="!uppercase !rounded-[10px] !px-6 !py-3 !text-[16px] !leading-none !font-semibold !border-2 !border-[#008832] !bg-[#008832] !text-white transition-all duration-200 hover:!border-[#006F29] hover:!bg-[#006F29] hover:!text-white hover:shadow-[0_6px_14px_rgba(0,111,41,0.18)]"
          >
            <span className="inline-flex items-center gap-2">
              <Image
                src="/icons/icon-home-white.svg"
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
              />
              Go Home
            </span>
          </Button>

          <Button
            onClick={reset} //tells next to retry rendering
            disableElevation //remove default MUI effects
            className="uppercase! rounded-[10px]! px-6! py-3! text-[16px]! leading-none! font-semibold! border-2! border-[#008832]! bg-[#008832]! text-white! transition-all duration-200 hover:border-[#006F29]! hover:bg-[#006F29]! hover:text-white! hover:shadow-[0_6px_14px_rgba(0,111,41,0.18)]"
          >
            <span className="inline-flex items-center gap-2">
              <Image
                src="/icons/icon-retry-white.svg"
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
              />
              Try Again
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
