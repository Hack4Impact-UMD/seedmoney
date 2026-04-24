"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNew from "@mui/icons-material/OpenInNew";
import Link from "next/link";

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

export default function FaqSection() {
  return (
    <div className="bg-white p-8 rounded-xl border border-[#e5e5e5] border-[2px]">
      <h2 className="text-xl font-bold text-[#212121] mb-6">
        <span className="flex flex-row items-center">
          Frequently Asked Questions

          <Link
            href="/faq"
            className="text-[#0288D1] text-[15px] ml-5 font-normal underline underline-offset-4"
          >
            View More
          </Link>
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
  );
}
