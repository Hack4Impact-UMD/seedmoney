"use client";

import { useEffect } from "react";
import Button from "@mui/material/Button";
import type {
  UserCampaign,
  UsersTableRow,
} from "@/src/types/frontend/usersTable";
import type { Status } from "@/src/types/db/enums";

interface ApplicationStatusPopUpProps {
  user: UsersTableRow;
  onClose: () => void;
}

const STATUS_CONFIG: Record<Status, { label: string; buttonLabel: string }> = {
  in_progress: { label: "in progress", buttonLabel: "REVIEW APPLICATION" },
  submitted_under_review: {
    label: "submitted",
    buttonLabel: "REVIEW APPLICATION",
  },
  approved: { label: "approved", buttonLabel: "VIEW CAMPAIGN" },
  not_approved: { label: "not approved", buttonLabel: "VIEW APPLICATION" },
  published: { label: "published", buttonLabel: "VIEW CAMPAIGN" },
  archived: { label: "archived", buttonLabel: "VIEW CAMPAIGN" },
};

const STATUS_ORDER: Status[] = [
  "submitted_under_review",
  "approved",
  "in_progress",
  "not_approved",
  "published",
  "archived",
];

function groupByStatus(campaigns: UserCampaign[]) {
  const groups: Partial<Record<Status, UserCampaign[]>> = {};
  for (const campaign of campaigns) {
    if (!groups[campaign.status]) {
      groups[campaign.status] = [];
    }
    groups[campaign.status]!.push(campaign);
  }
  return groups;
}

const ApplicationStatusPopUp = ({
  user,
  onClose,
}: ApplicationStatusPopUpProps) => {
  const groups = groupByStatus(user.campaigns);
  const fullName = `${user.first_name} ${user.last_name}`;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleCampaignAction = (campaign: UserCampaign) => {
    // TODO: Implement campaign action logic
    const action = STATUS_CONFIG[campaign.status].buttonLabel;
    console.log(`${action}: "${campaign.name}" (ID: ${campaign.campaign_id})`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm shadow-xl max-w-2xl w-full mx-4 p-8 max-h-[65vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[#1B5E20] text-xl font-bold mb-2">
          Application Status
        </h2>
        <hr className="border-gray-300" />

        <div className="overflow-y-auto flex-1">
          {STATUS_ORDER.filter((status) => groups[status]).map((status) => {
            const campaigns = groups[status]!;
            const config = STATUS_CONFIG[status];

            return (
              <div key={status}>
                <p className="text-gray-800 mb-3 mt-4">
                  {fullName} has{" "}
                  <span className="font-bold">&lt;{campaigns.length}&gt;</span>{" "}
                  {config.label} application{campaigns.length !== 1 ? "s" : ""}
                  {status === "in_progress" ? "." : ":"}
                </p>
                {status !== "in_progress" && (
                  <div className="flex flex-col gap-3 pl-6">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.campaign_id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-700">{campaign.name}</span>
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={() => handleCampaignAction(campaign)}
                        >
                          {config.buttonLabel}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatusPopUp;
