"use client";

import { SubmitEventHandler } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  MenuItem,
  Select,
  Typography,
  Button
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import OpenInNew from "@mui/icons-material/OpenInNew";

const FAQ_DATA = [
  {
    question: "What grants are available?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    question: "How and when do I thank my donors?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    question: "When will my project receive its funds?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    question: "How do I update my payment or contact details?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

export default function CampaignOverviewPage() {
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <div className="space-y-10 font-lato text-slate-700">
      <div className="h-[2px] bg-[#2d5a43] w-full" />

      <div className="bg-white p-8 rounded-xl border border-[#e5e5e5] border-[2px]">
        <h2 className="text-xl font-bold text-[#212121] mb-6">
          <span className = "flex flex-row items-center">
            Frequently Asked Questions

            <Link href="/" className="text-[#0288D1] text-[15px] ml-5 font-normal underline underline-offset-4">View More</Link>
            <OpenInNew fontSize="small" className="text-[#0288D1] ml-[5px]" />

          </span>


        </h2>
        <div className="space-y-4">
          {FAQ_DATA.map((faq) => (
            <Accordion
              key={faq.question}
              elevation={0}
              className="border border-[#e5e5e5] rounded-lg before:hidden"
              sx={{
                "&:not(:last-child)": { marginBottom: "1rem" },
                borderRadius: "8px !important",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className="font-bold text-slate-700">
                  {faq.question}
                </Typography>
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

      <div className="bg-white p-8 rounded-xl border border-[#e5e5e5] border-[2px]">
        <h2 className="text-xl font-bold text-[#212121] mb-2">Need Help?</h2>
        <p className="text-[#666666] text-sm mb-8 font-medium">
          Send a request to the SeedMoney team and we&apos;ll get back to you
          within one business day.
        </p>

        <form className="space-y-10 max-w-full" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="help-topic"
              className="block text-sm font-bold text-[#212121]"
            >
              What do you need help with?
            </label>
            <Select
              id="help-topic"
              name="help-topic"
              fullWidth
              variant="standard"
              defaultValue=""
              displayEmpty
              className="!text-[#9e9e9e]"
              sx={{
                "&:before": { borderBottomColor: "#1b76d2" },
                "&:after": { borderBottomColor: "#1b76d2" },
              }}
            >
              <MenuItem value="" disabled>
                Choose a topic
              </MenuItem>
              <MenuItem value="edit-campaign">Request a campaign page edit</MenuItem>
              <MenuItem value="new-stretch-goal">Request a new stretch goal</MenuItem>
              <MenuItem value="account-issue">Request an account issue</MenuItem>
              <MenuItem value="something-else">Something else</MenuItem>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="help-details"
              className="block text-sm font-bold text-slate-700"
            >
              Tell us more
            </label>
            <input
              id="help-details"
              name="help-details"
              type="text"
              placeholder="Describe what you need, the more detail, the faster we can help"
              className="w-full border-b border-[#949494] py-2 focus:outline-none transition placeholder:text-[#9e9e9e] text-sm"
            />
          </div>


          <Button variant = "contained" size = "small">
            <LogoutIcon className="!text-md" />
            Submit Request
          </Button>
        </form>
      </div>
    </div>
  );
}
