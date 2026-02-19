import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import Image from "next/image";
import logo from "../public/1e091ff252f77230.png";

export default function Loading() {
    return (
        <Box className = "min-h-screen flex items-center justify-center bg-[#F6FAF9]">
            <Stack direction = "column" spacing = {3} alignItems = "center">
                <Box className = "w-28 h-28 rounded-full bg-white border-2 border-[#00A63E] flex items-center justify-center">
                    <Image src = {logo} alt = "Logo" width = {70} height = {70}/>
                </Box>

                <CircularProgress size = {48} thickness = {5} sx = {{color: "#00A63E"}}/>

                <Typography variant = "h4" className = "font-bold text-[#00A63E]">
                    Page Loading
                </Typography>

                <Typography className = "text-base text-[#00A63E]">
                    Loading content, please wait...
                </Typography>
            </Stack>
        </Box>
    );
}
