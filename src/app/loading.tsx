import { Box, Stack, CircularProgress } from "@mui/material";
import Image from "next/image";
import { Lato, Open_Sans } from "next/font/google";
import logo from "../public/1e091ff252f77230.png";

const lato = Lato({
    subsets: ["latin"],
    weight: ["400"],
});

const openSans = Open_Sans({
    subsets: ["latin"],
    weight: ["300"],
});

export default function Loading() {
    return (
        <Box className = "min-h-screen flex items-center justify-center bg-[#F6FAF9]">
            <Stack direction = "column" spacing = {0} alignItems = "center">
                <Box className = "w-32 h-32 mb-5 -translate-y-4 rounded-full bg-white border-[3px] border-[#00A63E] flex items-center justify-center">
                    <Box className = "relative w-[82px] h-[82px] translate-y-[3px]">
                        <Image src = {logo} alt = "Logo" fill className = "object-contain object-center block"/>
                    </Box>
                </Box>

                <Box className = "mt-8 mb-10 text-[#00A63E]">
                    <CircularProgress size = {100} thickness = {3} color = "inherit" />
                </Box>

                <Box
                    component = "h1"
                    className = {`${lato.className} mt-3 mb-5 text-center text-[48px] leading-[56px] tracking-[0.18px] font-semibold text-[#00A63E]`}
                >
                    Page Loading
                </Box>

                <Box
                    component = "p"
                    className = {`${openSans.className} mt-1 text-center text-[30px] leading-[44px] tracking-[-0.5px] font-normal text-[#00A63E]`}
                >
                    Loading content, please wait...
                </Box>
            </Stack>
        </Box>
    );
}
