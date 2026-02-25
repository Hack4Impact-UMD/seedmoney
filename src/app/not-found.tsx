"use client"; //MUI components require a client context

import { Button } from "@mui/material";
import Image from "next/image"; //next's better image component

export default function NotFound() {
    return (
        <div className = "min-h-screen flex items-center justify-center bg-[#F6FAF9]">
            <div className = "flex flex-col items-center">
                <div className = "w-36 h-36 mb-8 rounded-full bg-white border-[3px] border-[#008832] flex items-center justify-center">
                    <div className = "relative w-[92px] h-[92px] translate-y-[3px]">
                        <Image src = "/seedMoneyLogo.png" alt = "Logo" fill className = "object-contain object-center block"/>
                    </div>
                </div>

                <h1 className = "text-center text-[72px] leading-[78px] tracking-[0.12px] font-bold text-[#008832]">
                    404
                </h1>

                <p className = "mt-3 text-center text-[34px] leading-[48px] tracking-[0.12px] font-semibold text-[#008832]">
                    Oops! This Page Not Found
                </p>

                <p className = "mt-3 text-center text-[19px] leading-[28px] tracking-[-0.1px] font-normal text-[#008832]">
                    The page you are looking for is unavailable or missing.
                </p>
                {/*! in front of tailwind code makes it override MUI default styling*/}
                <div className = "mt-9">
                    <Button
                        href = "/" //home page
                        disableElevation //remove default MUI effects
                        className = "!uppercase !rounded-[10px] !px-6 !py-3 !text-[16px] !leading-none !font-semibold !border-2 !border-[#008832] !bg-[#008832] !text-white transition-all duration-200 hover:!border-[#006F29] hover:!bg-[#006F29] hover:!text-white hover:shadow-[0_6px_14px_rgba(0,111,41,0.18)]"
                    >
                        <span className = "inline-flex items-center gap-2">
                            <Image src = "/icons/icon-home-white.svg" alt = "" width = {20} height = {20} aria-hidden = "true" />
                            Go Home
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
