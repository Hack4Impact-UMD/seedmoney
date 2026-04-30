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

export default function FaqSection() {
  return (
    <div className="bg-white p-8 rounded-xl border-2 border-[#e5e5e5] rounded-xl">
      <h2 className="text-xl font-bold text-[#212121] mb-6">
        <span className="flex flex-row items-center">
          Frequently Asked Questions
          <Link
            href="https://seedmoney.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0288D1] text-[15px] ml-5 font-normal underline underline-offset-4"
          >
            View More
          </Link>
          <OpenInNew fontSize="small" className="text-[#0288D1] ml-[5px]" />
        </span>
      </h2>

      <div className="space-y-4">
        <Accordion elevation={0} className="border border-[#e5e5e5] rounded-lg before:hidden" sx={{ "&:not(:last-child)": { marginBottom: "1rem" }, borderRadius: "8px !important" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className="font-bold text-slate-700">What grants are available?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography className="text-slate-500 text-sm leading-relaxed">
              Every approved campaign in the SeedMoney Challenge is eligible for a matching grant of up to $500. Grants are awarded based on fundraising milestones: campaigns that raise at least $150 from 3 or more donors qualify for a base grant, with larger grants for campaigns that reach higher thresholds. Full details are in your{" "}
              <Link href="/apply/terms" className="text-[#0288D1] underline underline-offset-4">
                Grantee Agreement
              </Link>
              .
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion elevation={0} className="border border-[#e5e5e5] rounded-lg before:hidden" sx={{ "&:not(:last-child)": { marginBottom: "1rem" }, borderRadius: "8px !important" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className="font-bold text-slate-700">How and when do I thank my donors?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography className="text-slate-500 text-sm leading-relaxed">
              We strongly encourage sending personal thank-you messages to each donor. You can download your full donor list using the CSV button above. GiveButter sends an automatic donation receipt, but a personal note from you makes a huge difference. We recommend thanking donors within 48 hours of their gift.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion elevation={0} className="border border-[#e5e5e5] rounded-lg before:hidden" sx={{ "&:not(:last-child)": { marginBottom: "1rem" }, borderRadius: "8px !important" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className="font-bold text-slate-700">When will my project receive its funds?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography className="text-slate-500 text-sm leading-relaxed">
              Funds are disbursed in January following the close of the Challenge on December 15. In late December, we&apos;ll email you a short form to confirm or update your payment details. Once confirmed, we&apos;ll send your campaign&apos;s raised funds along with any grant award.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion elevation={0} className="border border-[#e5e5e5] rounded-lg before:hidden" sx={{ "&:not(:last-child)": { marginBottom: "1rem" }, borderRadius: "8px !important" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className="font-bold text-slate-700">How do I update my payment or contact details?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography className="text-slate-500 text-sm leading-relaxed">
              You don&apos;t need to do anything right now. After the Challenge ends, we&apos;ll send you a secure link to review and confirm the payment information you provided in your application. If anything has changed, you can update it then. If urgent, use the support form below.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}