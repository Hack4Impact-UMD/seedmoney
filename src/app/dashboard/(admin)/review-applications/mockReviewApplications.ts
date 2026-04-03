export type ReviewApplicationStatus = "PENDING" | "DENIED" | "APPROVED";

export type ReviewApplication = {
  campaignId: number;
  submissionDate: string;
  campaignTitle: string;
  campaignLeader: string;
  status: ReviewApplicationStatus;
};

const REVIEW_APPLICATION_STATUS_KEY = "review-application-statuses";
const REVIEW_APPLICATION_STATUS_EVENT = "review-application-status-change";

export const reviewApplications: ReviewApplication[] = [
  {
    campaignId: 1,
    submissionDate: "2026-02-28",
    campaignTitle: "Fully Belly Community Garden",
    campaignLeader: "John Smith",
    status: "PENDING",
  },
  {
    campaignId: 2,
    submissionDate: "2026-03-01",
    campaignTitle: "Norman Garden",
    campaignLeader: "Norman Bates",
    status: "PENDING",
  },
  {
    campaignId: 3,
    submissionDate: "2026-02-24",
    campaignTitle: "Harvest Lane Pantry Beds",
    campaignLeader: "Melissa Grant",
    status: "DENIED",
  },
  {
    campaignId: 4,
    submissionDate: "2026-02-21",
    campaignTitle: "South Harbor Seed Library",
    campaignLeader: "David Flores",
    status: "DENIED",
  },
  {
    campaignId: 5,
    submissionDate: "2026-02-18",
    campaignTitle: "Brighton Block Orchard",
    campaignLeader: "Kiara Walker",
    status: "DENIED",
  },
  {
    campaignId: 6,
    submissionDate: "2026-02-16",
    campaignTitle: "Maple Street Pollinator Patch",
    campaignLeader: "Owen Price",
    status: "DENIED",
  },
  {
    campaignId: 7,
    submissionDate: "2026-02-13",
    campaignTitle: "West End Compost Collective",
    campaignLeader: "Elena Cruz",
    status: "DENIED",
  },
  {
    campaignId: 8,
    submissionDate: "2026-02-10",
    campaignTitle: "Riverside Kids Grow Lab",
    campaignLeader: "Monique Carter",
    status: "DENIED",
  },
  {
    campaignId: 9,
    submissionDate: "2026-02-09",
    campaignTitle: "North Hill Greenhouse Restart",
    campaignLeader: "Chris Patel",
    status: "DENIED",
  },
  {
    campaignId: 10,
    submissionDate: "2026-02-07",
    campaignTitle: "Sunrise Neighborhood Beds",
    campaignLeader: "Tina Douglas",
    status: "DENIED",
  },
  {
    campaignId: 11,
    submissionDate: "2026-02-05",
    campaignTitle: "Elmwood Produce Share",
    campaignLeader: "Robert Lane",
    status: "DENIED",
  },
  {
    campaignId: 12,
    submissionDate: "2026-02-02",
    campaignTitle: "River Market Teaching Garden",
    campaignLeader: "Alicia Stone",
    status: "DENIED",
  },
  {
    campaignId: 13,
    submissionDate: "2026-01-30",
    campaignTitle: "Parkside Soil Rebuild",
    campaignLeader: "Marcus Young",
    status: "DENIED",
  },
];

export const getReviewApplicationById = (campaignId: number) =>
  reviewApplications.find((application) => application.campaignId === campaignId);

export const getHydratedReviewApplicationById = (campaignId: number) =>
  getHydratedReviewApplications().find(
    (application) => application.campaignId === campaignId,
  );

export const getHydratedReviewApplications = (): ReviewApplication[] => {
  if (typeof window === "undefined") {
    return reviewApplications;
  }

  const raw = window.localStorage.getItem(REVIEW_APPLICATION_STATUS_KEY);

  if (!raw) {
    return reviewApplications;
  }

  try {
    const savedStatuses = JSON.parse(raw) as Record<number, ReviewApplicationStatus>;

    return reviewApplications.map((application) => ({
      ...application,
      status: savedStatuses[application.campaignId] ?? application.status,
    }));
  } catch {
    return reviewApplications;
  }
};

export const updateReviewApplicationStatus = (
  campaignIds: number[],
  status: ReviewApplicationStatus,
) => {
  if (typeof window === "undefined") {
    return;
  }

  const raw = window.localStorage.getItem(REVIEW_APPLICATION_STATUS_KEY);
  let savedStatuses: Record<number, ReviewApplicationStatus> = {};

  if (raw) {
    try {
      savedStatuses = JSON.parse(raw) as Record<number, ReviewApplicationStatus>;
    } catch {
      savedStatuses = {};
    }
  }

  campaignIds.forEach((campaignId) => {
    savedStatuses[campaignId] = status;
  });

  window.localStorage.setItem(
    REVIEW_APPLICATION_STATUS_KEY,
    JSON.stringify(savedStatuses),
  );
};

export const notifyReviewApplicationStatusChange = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(REVIEW_APPLICATION_STATUS_EVENT));
};

export const subscribeToReviewApplicationStatusChange = (
  callback: () => void,
) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => callback();
  window.addEventListener(REVIEW_APPLICATION_STATUS_EVENT, listener);

  return () => {
    window.removeEventListener(REVIEW_APPLICATION_STATUS_EVENT, listener);
  };
};
