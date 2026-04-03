'use client'
import { Box, Container, Typography, Link, Divider, Stack} from '@mui/material';

export default function Footer() {

  return (
    <Box component="footer" className="bg-[#333333] text-[#EEEEEE]">
      <Container>
        <Divider className="pt-8 before:border before:border-[#525252] after:border after:border-[#525252]">
          <span aria-hidden="true" className="text-sm">★</span>
        </Divider>

        <Box className="flex flex-col sm:flex-row justify-center items-start sm:gap-40 mb-1 py-2">

          {/* Left Column SeedMoney */}
          <Box className="w-full sm:w-auto text-center sm:text-left mb-0 sm:mb-2">
            <Typography  className="!text-[#76b852] !font-bold !mb-2 !mt-4 !text-[12px]">SeedMoney</Typography>
            <Stack spacing={0.5} className="mb-2">
              <Link onClick={() => console.log('Navigate -> /')} className="!text-[#EEEEEE] !no-underline !text-[12px] cursor-pointer">Home</Link>
              <Link onClick={() => console.log('Navigate -> /contact')} className="!text-[#EEEEEE] !no-underline !text-[12px] cursor-pointer">Contact</Link>
              <Link onClick={() => console.log('Navigate -> /faq')} className="!text-[#EEEEEE] !no-underline !text-[12px] cursor-pointer">FAQ</Link>
            </Stack>
          </Box>

          {/* Right Column Need Help? */}
          <Box className="w-full sm:w-auto text-center sm:text-left " >
            <Typography className="!text-[#76b852] !font-bold !mb-2 !mt-4 !text-[12px]">Need help?</Typography>
            <Stack spacing={0.5} className="mb-2">
              <Link onClick={() => console.log('Navigate -> /faq')} className="!text-[#EEEEEE] !no-underline !text-[12px] cursor-pointer">FAQ</Link>
              <Link onClick={() => console.log('Navigate -> /terms')} className="!text-[#EEEEEE] !no-underline !text-[12px] cursor-pointer">Terms</Link>
              <Link onClick={() => console.log('Navigate -> /privacy')} className="!text-[#EEEEEE] !no-underline !text-[12px] cursor-pointer">Privacy Policy</Link>
            </Stack>
          </Box>
        </Box>
        
        <Divider className="bg-[#525252]" />
        <Typography variant="body2" align="center" className="!text-[#EEEEEE] !font-bold !py-4" >
          © {new Date().getFullYear()} SeedMoney All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  )
}
