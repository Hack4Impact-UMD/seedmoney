"use client"; //used onClick so we need this line

import { Box, Stack, Button } from "@mui/material";
import Image from "next/image"; //next's better image component
import Link from "next/link"; //next's client side nav
import { Lato, Open_Sans } from "next/font/google";
import logo from "../public/1e091ff252f77230.png"; //seedmoney logo

//font for 404 and Oops!
const lato = Lato({
    subsets: ["latin"],
    weight: ["700"],
});
//font for text under Oops!
const openSans = Open_Sans({
    subsets: ["latin"],
    weight: ["400"],
});

export default function NotFound() {
    return (
        <Box className = "min-h-screen flex items-center justify-center bg-[#F6FAF9]">
            <Stack direction = "column" spacing = {0} alignItems = "center">
                <Box className = "w-36 h-36 mb-8 rounded-full bg-white border-[3px] border-[#00A63E] flex items-center justify-center">
                    <Box className = "relative w-[92px] h-[92px] translate-y-[3px]">
                        <Image src = {logo} alt = "Logo" fill className = "object-contain object-center block"/>
                    </Box>
                </Box>

                <Box
                    component = "h1"
                    className = {`${lato.className} text-center text-[72px] leading-[78px] tracking-[0.12px] font-bold text-[#00A63E]`}
                >
                    404
                </Box>

                <Box
                    component = "p"
                    className = {`${lato.className} mt-3 text-center text-[34px] leading-[48px] tracking-[0.12px] font-semibold text-[#00A63E]`}
                >
                    Oops! This Page Not Found
                </Box>

                <Box
                    component = "p"
                    className = {`${openSans.className} mt-3 text-center text-[19px] leading-[28px] tracking-[-0.1px] font-normal text-[#00A63E]`}
                >
                    The page you are looking for is unavailable or missing.
                </Box>
                {/*! in front of tailwind code makes it override MUI default styling*/}
                <Box className = "mt-9">
                    <Button
                        component = {Link}
                        href = "/" //home page
                        disableElevation //remove default MUI effects
                        className = "!normal-case !rounded-[10px] !px-6 !py-3 !text-[16px] !leading-none !font-semibold !border-2 !border-[#00A63E] !bg-[#00A63E] !text-white transition-all duration-200 hover:!-translate-y-0.5 hover:!bg-white hover:!text-[#00A63E] hover:shadow-[0_6px_14px_rgba(0,166,62,0.18)]"
                    >
                        <span className = "inline-flex items-center gap-2">
                            {/*home icon*/}
                            <svg aria-hidden = "true" viewBox = "0 0 24 24" className = "w-5 h-5 fill-current">
                                <path d = "M12 3 3 10v11h6v-6h6v6h6V10l-9-7Zm7 16h-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6H5v-8l7-5.44L19 11v8Z" />
                            </svg>
                            Go Home
                        </span>
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
