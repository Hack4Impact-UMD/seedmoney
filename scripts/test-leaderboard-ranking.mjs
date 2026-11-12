import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadModule(path) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports });
  return exports;
}

const { rankCampaigns, getCampaignRank, getCampaignRankingInputs } = loadModule(
  "../src/lib/leaderboardRanking.ts",
);
const { getRankGrantTier, rankGrantTiers } = loadModule(
  "../src/components/leaderboard/grantStatOptions.ts",
);

test("ranking uses eligible totals instead of overall fundraising", () => {
  const campaign = {
    campaign_id: 1,
    raised: 10000,
    donors: 100,
    competitionStanding: { raised: 25.5, donation_count: 2 },
  };
  const inputs = getCampaignRankingInputs(campaign);
  assert.equal(inputs.raised, 25.5);
  assert.equal(inputs.donors, 2);
  assert.equal(campaign.raised, 10000);
  assert.equal(getCampaignRankingInputs({ ...campaign, competitionStanding: null }).raised, 0);
});

test("amount, donation count, and campaign ID give consistent ranks", () => {
  const campaigns = [
    { campaignId: 3, raised: 100, donors: 2 },
    { campaignId: 2, raised: 100, donors: 3 },
    { campaignId: 1, raised: 100, donors: 3 },
    { campaignId: 4, raised: 200, donors: 1 },
  ];
  assert.equal(rankCampaigns(campaigns).map((c) => c.campaignId).join(","), "4,1,2,3");
  assert.equal(campaigns[0].campaignId, 3);
  assert.equal(getCampaignRank(campaigns, 2), 3);
  assert.equal(getCampaignRank(campaigns, 999), null);
});

test("dashboard and leaderboard use the same rank and grant before filtering", () => {
  const campaigns = Array.from({ length: 300 }, (_, index) => ({
    campaignId: index + 1,
    raised: 1000 - index,
    donors: 1,
  }));
  const leaderboard = rankCampaigns(campaigns);
  for (const campaign of leaderboard) {
    const dashboardRank = getCampaignRank(campaigns, campaign.campaignId);
    assert.equal(dashboardRank, campaign.displayRank);
    assert.equal(getRankGrantTier(dashboardRank)?.amount, getRankGrantTier(campaign.displayRank)?.amount);
  }
  assert.equal(leaderboard.filter((c) => c.campaignId === 50)[0].displayRank, 50);
});

test("every grant-tier boundary and non-qualifying rank is handled", () => {
  const amounts = [1000, 900, 800, 600, 500, 400, 300, 200, 100];
  rankGrantTiers.forEach((tier, index) => {
    assert.equal(getRankGrantTier(tier.minRank)?.amount, amounts[index]);
    assert.equal(getRankGrantTier(tier.maxRank)?.amount, amounts[index]);
    if (index > 0) assert.equal(tier.minRank, rankGrantTiers[index - 1].maxRank + 1);
  });
  for (const rank of [null, undefined, 0, -1, 289, 300]) {
    assert.equal(getRankGrantTier(rank), null);
  }
});
