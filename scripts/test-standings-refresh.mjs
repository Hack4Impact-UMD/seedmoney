import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import ts from "typescript";

const require = createRequire(import.meta.url);
const defaultModule = (value) => ({ __esModule: true, default: value });
const element = React.createElement;
const placeholder = ({ children, open }) => open === false ? null : element("div", null, children);

function load(path, mocks = {}) {
  const exports = {};
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
  });
  vm.runInNewContext(outputText, {
    exports, console, URLSearchParams,
    require(name) {
      if (name in mocks) return mocks[name];
      if (name.startsWith("@/src/components/")) return defaultModule(placeholder);
      if (name.startsWith("@mui/icons-material/")) return defaultModule(() => null);
      return require(name);
    },
  });
  return exports;
}

async function queryStates(data) {
  const client = new QueryClient();
  let failing = false;
  const observer = new QueryObserver(client, {
    queryKey: ["standing-refresh-test"], retry: false,
    queryFn: async () => {
      if (failing) throw new Error("Temporary API failure");
      return data;
    },
  });
  const unsubscribe = observer.subscribe(() => {});
  try {
    await observer.refetch();
    const success = observer.getCurrentResult();
    failing = true;
    await observer.refetch();
    const backgroundFailure = observer.getCurrentResult();
    const initialObserver = new QueryObserver(client, {
      queryKey: ["initial-failure-test"], retry: false,
      queryFn: async () => { throw new Error("Initial API failure"); },
    });
    await initialObserver.refetch();
    return { success, backgroundFailure, initialFailure: initialObserver.getCurrentResult() };
  } finally {
    unsubscribe();
    client.clear();
  }
}

const competition = { competition_id: 1, start_date: "2026-11-15", end_date: "2026-12-15" };
const campaign = {
  campaign_id: 1, competition_id: 1, status: "published", name: "Test Garden",
  raised: 5000, donors: 100, goal: 10000, givebutterlink: "https://example.com/garden",
  competitionStanding: { raised: 250, donation_count: 5 },
};
const ranking = load("../src/lib/leaderboardRanking.ts");
const tiers = load("../src/components/leaderboard/grantStatOptions.ts");

test("leaderboard keeps cached data after a failed background refresh", async () => {
  const states = await queryStates([campaign]);
  let query = states.success;
  const Page = load("../src/app/leaderboard/page.tsx", {
    "next/font/google": { Open_Sans: () => ({ variable: "font-test" }) },
    "@/src/components/leaderboard/LeaderboardPage": defaultModule(({ data }) => element("main", null, `Leaderboard raised ${data.campaigns[0]?.raised}`)),
    "@/src/components/leaderboard/LeaderboardEmptyState": defaultModule(({ title }) => element("section", null, title)),
    "@/src/hooks/competition-metadata/useReadCurrentCompetition": defaultModule(() => ({ data: competition, isLoading: false })),
    "@/src/hooks/campaigns/useReadCampaignsByCompId": defaultModule(() => query),
    "@/src/hooks/campaign-image-records/useReadCampaignImageUrlsByCampaignIds": defaultModule(() => ({ data: {}, isLoading: false })),
    "@/src/hooks/transactions/useReadTransactionsByCampaignIds": defaultModule(() => ({ data: [], isLoading: false, isLoadingError: false })),
    "@/src/lib/leaderboardGrantCalculations": { calculateSpecialGrantCampaignIds: () => ({ strongStart: null, strongFinish: null, geographicInterest: [] }) },
    "@/src/lib/leaderboardRanking": ranking,
    "@/src/constants/gardenCategories": { leaderboardGardenCategories: [] },
  }).default;
  assert.match(renderToStaticMarkup(element(Page)), /Leaderboard raised 250/);
  query = states.backgroundFailure;
  assert.ok(query.error);
  assert.match(renderToStaticMarkup(element(Page)), /Leaderboard raised 250/);
  query = states.initialFailure;
  const failed = renderToStaticMarkup(element(Page));
  assert.match(failed, /role="alert"/);
  assert.match(failed, /Leaderboard temporarily unavailable/);
  assert.doesNotMatch(failed, /Leaderboard raised/);
});

test("standing failures and loading stay inside the card area", async () => {
  const states = await queryStates({ rank: 50, totalProjects: 100 });
  let query = states.success;
  const Shell = load("../src/app/dashboard/(users)/[campaignId]/DashboardShell.tsx", {
    "next/navigation": {
      useParams: () => ({ campaignId: "1" }), usePathname: () => "/dashboard/1",
      useSearchParams: () => new URLSearchParams(),
      useRouter: () => ({ push() {}, replace() {} }),
      notFound: () => { throw new Error("Unexpected not-found"); },
    },
    "@/src/context/AuthProvider": { useAuth: () => ({ user: { id: "test-user" } }) },
    "@/src/hooks/users/useUserByAuthId": defaultModule(() => ({ data: { is_admin: false }, isLoading: false })),
    "@/src/hooks/campaigns/useReadCampaign": defaultModule(() => ({ data: [campaign], isLoading: false })),
    "@/src/hooks/campaigns/useCampaignStanding": defaultModule(() => query),
    "@/src/hooks/competition-metadata/useReadCurrentCompetition": defaultModule(() => ({ data: competition })),
    "@/src/hooks/transactions/useRaisedChangePercent": defaultModule(() => ({ percent: null })),
    "@/src/components/dashboard/TotalRaisedCard": { TotalRaisedCard: () => element("div", null, "Overall fundraising remains visible") },
    "@/src/components/dashboard/TotalDonorsCard": { TotalDonorsCard: () => null },
    "@/src/components/dashboard/DaysRemainingCard": { DaysRemainingCard: () => null },
    "@/src/components/dashboard/ChallengeStandingCard": { ChallengeStandingCard: ({ rank }) => element("div", null, `Standing rank ${rank}`) },
    "@/src/components/leaderboard/grantStatOptions": tiers,
    "@/src/lib/utils/statusConversions": { getStatusLabel: () => "Published" },
    "@mui/material": { Chip: ({ label }) => element("span", null, label) },
    "@mui/material/Button": defaultModule(placeholder),
  }).default;
  const render = () => renderToStaticMarkup(element(Shell, null, element("p", null, "Dashboard content")));
  assert.match(render(), /Standing rank 50/);
  query = states.backgroundFailure;
  assert.match(render(), /Standing rank 50/);
  query = states.initialFailure;
  const failed = render();
  assert.match(failed, /Overall fundraising remains visible/);
  assert.match(failed, /Dashboard content/);
  assert.match(failed, /Unable to load Challenge Standing/);
  assert.doesNotMatch(failed, /Standing rank/);
  query = { isPending: true, isLoadingError: false, data: undefined };
  const loading = render();
  assert.match(loading, /Overall fundraising remains visible/);
  assert.match(loading, /role="status"/);
});
