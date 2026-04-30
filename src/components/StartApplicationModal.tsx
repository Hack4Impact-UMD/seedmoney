"use client";

import Button from "@mui/material/Button";
import Logout from "@mui/icons-material/Logout";
import moment from "moment";

import BaseModal from "@/src/components/bases/BaseModal";

interface StartApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  startDate?: string | null;
  endDate?: string | null;
}

export default function StartApplicationModal({
  open,
  onClose,
  onStart,
  startDate,
  endDate,
}: StartApplicationModalProps) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="SeedMoney Challenge Application"
    >
      <p className="mb-4 text-base text-gray-500">
        SeedMoney supports nonprofit and community-based food garden projects
        through a combination of online fundraising tools and grant funding.
      </p>

      <ul className="mb-4 list-disc pl-5">
        <li className="text-base text-black">
          By completing this application, you are applying to participate in
          the SeedMoney Challenge and to run a 30-day online fundraising
          campaign supported by SeedMoney running from{" "}
          {moment(startDate).format("MM/DD/YYYY")}–
          {moment(endDate).format("MM/DD/YYYY")}
        </li>
      </ul>

      <p className="mb-6 text-base text-gray-500">
        Most applicants complete this application in 20–30 minutes.
      </p>

      <div className="flex justify-end">
        <Button
          variant="contained"
          size="medium"
          onClick={onStart}
          endIcon={<Logout />}
        >
          Start Application
        </Button>
      </div>
    </BaseModal>
  );
}
