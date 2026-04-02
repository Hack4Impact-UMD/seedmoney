"use client";

import { SubmitEventHandler } from "react";
import { notFound, useParams, useRouter } from "next/navigation";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  MenuItem,
  Select,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LogoutIcon from '@mui/icons-material/Logout';
import { getCampaignById } from "../../sampleCampaigns";

const MOCK_CAMPAIGN_STATS = {
  1: { raised: 10000, donors: 12, daysRemaining: 23 },
  2: { raised: 4200, donors: 8, daysRemaining: 16 },
  3: { raised: 1095, donors: 41, daysRemaining: 0 },
  4: { raised: 18340, donors: 27, daysRemaining: 11 },
  5: { raised: 8700, donors: 19, daysRemaining: 31 },
};

const FAQ_DATA = [
  { question: "What grants are available?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { question: "How and when do I thank my donors?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { question: "When will my project receive its funds?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { question: "How do I update my payment or contact details?", answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
];

export default function CampaignOverviewPage() {
  const router = useRouter();
  const { campaignId } = useParams<{ campaignId: string }>();
  const selectedCampaignId = Number(campaignId);
  const campaign = getCampaignById(selectedCampaignId);

  if (!campaign) {
    notFound();
  }

  const campaignStats =
    MOCK_CAMPAIGN_STATS[selectedCampaignId as keyof typeof MOCK_CAMPAIGN_STATS] ?? {
      raised: 0,
      donors: 0,
      daysRemaining: 0,
    };

  const progress =
    campaign.goal > 0
      ? Math.min((campaignStats.raised / campaign.goal) * 100, 100)
      : 0;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  const handleTabChange = (tab: "Overview" | "Donors" | "Analytics") => {
    const basePath = `/dashboard/${selectedCampaignId}`;

    if (tab === "Donors") {
      router.push(`${basePath}/donors`);
      return;
    }

    if (tab === "Analytics") {
      router.push(`${basePath}/analytics`);
      return;
    }

    router.push(basePath);
  };

  return (
    <div className="min-h-screen bg-[#f6faf9] p-8 font-lato text-slate-700">
      {/* header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold text-[#2d5a43]">{campaign.name}</h1>
        </div>
        
      </div>

      <div className="max-w-5xl mx-auto mb-4 flex flex-col gap-3">
        <div className="flex gap-5">
          <button
            type="button"
            onClick={() => handleTabChange("Overview")}
            className="pb-1 px-3 border-b-2 border-[#1b76d2] text-[#1b76d2] font-bold text-sm hover:cursor-pointer"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("Donors")}
            className="pb-1 px-3 text-[#636464] font-bold text-sm hover:cursor-pointer"
          >
            Donors
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("Analytics")}
            className="pb-1 px-3 text-[#636464] font-bold text-sm hover:cursor-pointer"
          >
            Analytics
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="bg-[#2c7a45] text-white px-4 py-2 rounded-md font-bold text-xs uppercase hover:bg-[#2d5a43] transition">
            View Campaign Site
          </button>
          <button className="bg-white border border-[#2c7a45] text-[#2c7a45] px-4 py-2 rounded-md font-bold text-xs uppercase hover:bg-emerald-50 transition">
            Copy Campaign Site Link
          </button>
          <button className="bg-white border border-[#2c7a45] text-[#2c7a45] px-4 py-2 rounded-md font-bold text-xs uppercase hover:bg-emerald-50 transition">
            View Leaderboard
          </button>
        </div>

      </div>

      <main className="max-w-5xl mx-auto space-y-10">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Total Raised Card */}
          <div className="bg-white p-8 rounded-xl border border-[#e5e5e5] border-[2px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-md text-[#3a3a3a]">Total Raised</span>
                <AttachMoneyIcon className="!text-[#666666] !text-3xl" />
              </div>
              
              <div className="relative pt-1 mb-8">
                <div className="overflow-hidden h-24 text-xs flex rounded-full bg-[#bce5bf]">
                  <div 
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#56bd61] font-bold text-sm"
                  >
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-bold text-[#293140]">${campaignStats.raised.toLocaleString()}</div>
                <div className="text-sm text-[#6a7282] font-medium mt-1">
                  {Math.round(progress)}% of ${campaign.goal.toLocaleString()} goal
                </div>
              </div>
              {/* TODO: make growth dynamic */}
              <div className="text-[#00a63e] text-sm font-bold flex items-center mb-1">
                +12.5% from last week
              </div>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-6">
            {/* Total Donors Card */}
            <div className="bg-white p-6 rounded-xl border border-[#e5e5e5] border-[2px] flex justify-between">
              <div>
                <span className="text-md text-[#3a3a3a]">Total Donors</span>
                <div className="text-4xl font-bold text-[#0f1828] mt-2">{campaignStats.donors}</div>
                <div className="text-sm text-[#6a7282] font-medium">Donors</div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <PeopleAltOutlinedIcon className="!text-[#666666] !text-3xl" />
                {/* TODO: make growth dynamic */}
                <span className="text-[#00a63e] text-sm font-bold">+12.5% from last week</span>
              </div>
            </div>

            {/* Days Remaining Card */}
            <div className="bg-white p-6 rounded-xl border border-[#e5e5e5] border-[2px] flex justify-between">
              <div>
                <span className="text-md text-[#3a3a3a]">Days Remaining</span>
                <div className="text-4xl font-bold text-[#0f1828] mt-2">{campaignStats.daysRemaining}</div>
                <div className="text-sm text-[#6a7282] font-medium">days until campaign ends</div>
              </div>
              <TrendingUpIcon className="!text-[#666666] !text-3xl" />
            </div>
          </div>
        </div>

        <div className="h-[2px] bg-[#2d5a43] w-full" />

        {/* FAQ Section */}
        <div className="bg-white p-8 rounded-xl border border-[#e5e5e5] border-[2px]">
          <h2 className="text-xl font-bold text-[#212121] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <Accordion 
                key={index} 
                elevation={0} 
                className="border border-[#e5e5e5] rounded-lg before:hidden"
                sx={{ '&:not(:last-child)': { marginBottom: '1rem' }, borderRadius: '8px !important' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography className="font-bold text-slate-700">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography className="text-slate-500 text-sm leading-relaxed">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </div>

        <div className="h-[2px] bg-[#2d5a43] w-full" />

        {/* Help Form Section */}
        <div className="bg-white p-8 rounded-xl border border-[#e5e5e5] border-[2px]">
          <h2 className="text-xl font-bold text-[#212121] mb-2">Need Help?</h2>
          <p className="text-[#666666] text-sm mb-8 font-medium">
            Send a request to the SeedMoney team and we&apos;ll get back to you within one business day.
          </p>
          
          <form className="space-y-10 max-w-full" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="help-topic" className="block text-sm font-bold text-[#212121]">What do you need help with?</label>
              <Select
                id="help-topic"
                name="help-topic"
                fullWidth
                variant="standard"
                defaultValue=""
                displayEmpty
                className="!text-[#9e9e9e]"
                sx={{ '&:before': { borderBottomColor: '#1b76d2' }, '&:after': { borderBottomColor: '#1b76d2' } }}
              >
                <MenuItem value="" disabled>Choose a topic</MenuItem>
                <MenuItem value="tech">Technical Support</MenuItem>
                <MenuItem value="billing">Billing</MenuItem>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="help-details" className="block text-sm font-bold text-slate-700">Tell us more</label>
              <input 
                id="help-details"
                name="help-details"
                type="text" 
                placeholder="Describe what you need, the more detail, the faster we can help"
                className="w-full border-b border-[#949494] py-2 focus:outline-none transition placeholder:text-[#9e9e9e] text-sm"
              />
            </div>

            <button type="submit" className="flex items-center gap-2 bg-[#2c7a45] text-white px-4 py-2 rounded-md font-bold text-sm uppercase hover:bg-[#2d5a43] transition">
              <LogoutIcon className="!text-md" />
              Submit Request
            </button>
          </form>
        </div>
      </main>

    </div>
  );
}
