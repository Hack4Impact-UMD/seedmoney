"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import StartApplicationModal from "@/src/components/StartApplicationModal";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";

export default function NotStarted() {
  const router = useRouter();
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const { data: currentCompetitionData } = useReadCurrentCompetition();

  return (
    <>
      <Box className="flex w-full flex-col items-center justify-center rounded-2xl bg-white px-6 py-20 text-center shadow-sm md:px-16">
        <Box className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#2e7d32] mb-6">
          <Image
            src="/seedMoneyLogo.png"
            alt="SeedMoney logo"
            width={48}
            height={48}
          />
        </Box>

        <Typography className="!text-2xl !font-semibold !text-gray-800 !mb-2">
          No campaigns created
        </Typography>

        <Typography className="!text-base !text-gray-500 !mb-8 text-center">
          Create your first campaign to start sharing your story and receiving
          support.
        </Typography>

        <Button
          variant="contained"
          size="medium"
          startIcon={<AddIcon />}
          onClick={() => setOpenApplyModal(true)}
        >
          New Campaign
        </Button>
      </Box>

      <StartApplicationModal
        open={openApplyModal}
        onClose={() => setOpenApplyModal(false)}
        onStart={() => {
          setOpenApplyModal(false);
          router.push("/apply");
        }}
        startDate={currentCompetitionData?.start_date}
        endDate={currentCompetitionData?.end_date}
      />
    </>
  );
}
