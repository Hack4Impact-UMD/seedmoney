"use client"; //MUI components require a client context

import { Button } from "@mui/material";
import Image from "next/image"; //next's better image component
import homeIconGreen from "../public/icon-home-green.svg";
import homeIconWhite from "../public/icon-home-white.svg";
import logo from "../public/1e091ff252f77230.png"; //seedmoney logo

export default function NotFound() {
    return (
        <div className = "min-h-screen flex items-center justify-center bg-[#F6FAF9]">
            <div className = "flex flex-col items-center">
                <div className = "w-36 h-36 mb-8 rounded-full bg-white border-[3px] border-[#00A63E] flex items-center justify-center">
                    <div className = "relative w-[92px] h-[92px] translate-y-[3px]">
                        <Image src = {logo} alt = "Logo" fill className = "object-contain object-center block"/>
                    </div>
                </div>

                <h1 className = "text-center text-[72px] leading-[78px] tracking-[0.12px] font-bold text-[#00A63E]">
                    404
                </h1>

                <p className = "mt-3 text-center text-[34px] leading-[48px] tracking-[0.12px] font-semibold text-[#00A63E]">
                    Oops! This Page Not Found
                </p>

                <p className = "mt-3 text-center text-[19px] leading-[28px] tracking-[-0.1px] font-normal text-[#00A63E]">
                    The page you are looking for is unavailable or missing.
                </p>
                {/*! in front of tailwind code makes it override MUI default styling*/}
                <div className = "mt-9">
                    <Button
                        href = "/" //home page
                        disableElevation //remove default MUI effects
                        className = "group !normal-case !rounded-[10px] !px-6 !py-3 !text-[16px] !leading-none !font-semibold !border-2 !border-[#00A63E] !bg-[#00A63E] !text-white transition-all duration-200 hover:!bg-white hover:!text-[#00A63E] hover:shadow-[0_6px_14px_rgba(0,166,62,0.18)]"
                    >
                        <span className = "inline-flex items-center gap-2">
                            <span aria-hidden = "true" className = "relative inline-block w-5 h-5">
                                <Image src = {homeIconWhite} alt = "" width = {20} height = {20} className = "block group-hover:hidden" />
                                <Image src = {homeIconGreen} alt = "" width = {20} height = {20} className = "hidden group-hover:block" />
                            </span>
                            Go Home
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
