import { CircularProgress } from "@mui/material"; 
import Image from "next/image"; //next's better image component
import logo from "../public/seedmoneyLogo.png"; //seedmoney logo

export default function Loading() {
    return (
        <div className = "min-h-screen flex items-center justify-center bg-[#F6FAF9]">
            <div className = "flex flex-col items-center">
                {/*seedmoney logo*/}
                <div className = "w-32 h-32 mb-5 -translate-y-4 rounded-full bg-white border-[3px] border-[#00A63E] flex items-center justify-center">
                    <div className = "relative w-[82px] h-[82px] translate-y-[3px]">
                        <Image src = {logo} alt = "Logo" fill className = "object-contain object-center block"/>
                    </div>
                </div>
                {/*MUI spinner progress thingy*/}
                <div
                    className = "mt-8 mb-10 text-[#00A63E]"
                    role="status"
                    aria-label="Loading"
                    aria-live="polite"
                >
                    <CircularProgress size = {100} thickness = {3} color = "inherit" />
                </div>
                
                <h1 className = "mt-3 mb-5 text-center text-[48px] leading-[56px] tracking-[0.18px] font-semibold text-[#00A63E]">
                    Page Loading
                </h1>

                <p className = "mt-1 text-center text-[30px] leading-[44px] tracking-[-0.5px] font-normal text-[#00A63E]">
                    Loading content, please wait...
                </p>
            </div>
        </div>
    );
}
