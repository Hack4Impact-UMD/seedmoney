"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

type NotCompleteProps = {
  onContinueApplication: () => void;
};

export default function NotComplete({ onContinueApplication }: NotCompleteProps) {
  return (
    <Box className="flex flex-col items-center justify-center py-20 px-16 bg-white rounded-2xl shadow-sm w-full">
      <Box className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#2e7d32] mb-6">
        <Image src="/seedMoneyLogo.png" alt="SeedMoney logo" width={48} height={48} />
      </Box>

      <Typography className="!text-2xl !font-semibold !text-gray-800 !mb-2">
        Your application hasn&apos;t been submitted
      </Typography>

      <Typography className="!text-base !text-gray-500 !mb-8 text-center">
        Your application is saved as a draft. Complete your submission to move
        forward.
      </Typography>

      <Button
        variant="contained"
        size="medium"
        onClick={onContinueApplication}
      >
        Continue Application
      </Button>
    </Box>
  );
}
