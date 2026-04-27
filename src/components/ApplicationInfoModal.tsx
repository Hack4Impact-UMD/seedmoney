"use client";

import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import BaseModal from "@/src/components/bases/BaseModal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ApplicationInfoModal({ open, onClose }: Props) {
  const router = useRouter();

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="SeedMoney Challenge Application"
      containerClassName="!w-[90vw] !max-w-sm"
    >
      <p className="text-sm text-[#666666] mb-3">
        SeedMoney supports nonprofit and community-based food garden projects
        through a combination of online fundraising tools and grant funding.
      </p>
      <ul className="text-sm text-[#666666] list-disc pl-4 mb-3">
        <li>
          By completing this application, you are applying to participate in the
          SeedMoney Challenge and to run a 30-day online fundraising campaign
          supported by SeedMoney.
        </li>
      </ul>
      <p className="text-sm text-[#666666] mb-4">
        Most applicants complete this application in 20–30 minutes.
      </p>
      <Button
        variant="contained"
        fullWidth
        onClick={() => {
          onClose();
          router.push("/apply");
        }}
      >
        Start Application
      </Button>
    </BaseModal>
  );
}
