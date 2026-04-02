"use client";

import { SubmitEventHandler } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";

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
          Frequently Asked Questions
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
              <MenuItem value="tech">Technical Support</MenuItem>
              <MenuItem value="billing">Billing</MenuItem>
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

          <button
            type="submit"
            className="flex items-center gap-2 bg-[#2c7a45] text-white px-4 py-2 rounded-md font-bold text-sm uppercase hover:bg-[#2d5a43] transition"
          >
            <LogoutIcon className="!text-md" />
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
