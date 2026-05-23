"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function Pending({
  onViewApplication,
}: {
  onViewApplication?: () => void;
}) {
  return (
    <Box className="flex flex-col items-center justify-center py-20 px-16 bg-white rounded-2xl shadow-sm w-full">
      <Box className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#2e7d32] mb-6">
        <Image
          src="/seedMoneyLogo.png"
          alt="SeedMoney logo"
          width={48}
          height={48}
        />
      </Box>

      <Typography className="!text-2xl !font-semibold !text-gray-800 !mb-2">
        Your campaign is under review
      </Typography>

      <Typography className="!text-base !text-gray-500 text-center max-w-md">
        We&apos;ll email you once your application is approved.
      </Typography>

      {onViewApplication && (
        <Button
          variant="outlined"
          size="small"
          onClick={onViewApplication}
          endIcon={<ArrowForwardIcon />}
          className="mt-6!"
        >
          View Application
        </Button>
      )}
    </Box>
  );
}
