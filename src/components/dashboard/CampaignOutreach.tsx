"use client";


import { useState } from "react";
import { Alert, Button } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import BaseModal from "@/src/components/bases/BaseModal";
import BaseAlert from "@/src/components/bases/BaseAlert";
import { outreachTemplates, type OutreachTemplate } from "@/src/lib/campaign-outreach";

export default function CampaignOutreach() {
  const [preview, setPreview] = useState<OutreachTemplate | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  async function copyTemplate(template: OutreachTemplate) {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.body}`);
      setCopiedTitle(template.title);
    } catch {
      setCopyError("Unable to copy to your clipboard. Open Preview to select and copy the text manually.");
    }
  }

  function closePreview() {
    setPreview(null);
    setCopyError(null);
  }

  return (
    <section id="dashboard-outreach" className="scroll-mt-20 font-lato text-[#123A1E]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Campaign Outreach</h1>
        <p className="mt-2 max-w-3xl text-base leading-6 text-[#666666]">
          Reach your supporters throughout the SeedMoney Challenge with ready-to-use email templates.
        </p>
      </div>
      <div className="mb-6 flex gap-3 rounded-lg border border-[#C4E8C8] bg-[#EDF7ED] p-4">
        <LightbulbOutlinedIcon className="mt-0.5 shrink-0 text-[#2D7A45]" />
        <div>
          <h2 className="font-bold">Make each message your own</h2>
          <p className="mt-1 text-sm leading-6 text-[#666666]">
            Preview a template, replace the [bracketed fields] with your garden’s details and campaign link,
            then send it using your own email. All nine templates are available whenever you need them.
          </p>
        </div>
      </div>

      {copyError && !preview && <Alert severity="error" className="mb-4">{copyError}</Alert>}
      <div className="rounded-lg border border-[#E0E0E0] bg-white p-4 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Your Campaign Resources</h2>
          <span className="text-sm text-[#666666]">9 email templates</span>
        </div>
        <ul className="space-y-3">
          {outreachTemplates.map((template) => (
            <li key={template.id} className="flex flex-col gap-4 rounded-lg border border-[#E0E0E0] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EDF7ED] text-[#2D7A45]">
                  <EmailOutlinedIcon aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold">{template.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-[#666666]">{template.description}</p>
                  <p className="mt-2 text-sm font-semibold text-[#2D7A45]">{template.date}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button variant="outlined" size="small" startIcon={<VisibilityOutlinedIcon />} aria-label={`Preview ${template.title}`} onClick={() => { setCopyError(null); setPreview(template); }}>
                  Preview
                </Button>
                <Button variant="contained" size="small" startIcon={<ContentCopyIcon />} aria-label={`Copy ${template.title}`} onClick={() => void copyTemplate(template)}>
                  Copy
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <BaseModal open={preview !== null} onClose={closePreview} containerClassName="!rounded-lg md:!w-[720px]">
        {preview && (
          <div role="region" aria-label={`${preview.title} preview`}>
            <h2 className="mb-4 text-xl font-bold">{preview.title}</h2>
            <p className="text-sm font-bold text-[#666666]">Subject line</p>
            <p className="mt-1 select-text font-semibold">{preview.subject}</p>
            <p className="mb-2 mt-5 text-sm font-bold text-[#666666]">Message</p>
            <div className="select-text whitespace-pre-wrap text-sm leading-6 text-[#333333]">{preview.body}</div>
            <div className="mt-5 rounded-lg bg-[#EDF7ED] p-4">
              <h3 className="font-bold">Coaching tip</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#666666]">{preview.coaching}</p>
            </div>
            {copyError && <Alert severity="error" className="mt-4">{copyError}</Alert>}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button variant="outlined" size="small" onClick={closePreview}>Close</Button>
              <Button variant="contained" size="small" startIcon={<ContentCopyIcon />} onClick={() => void copyTemplate(preview)}>Copy to Clipboard</Button>
            </div>
          </div>
        )}
      </BaseModal>
      <BaseAlert open={copiedTitle !== null} onClose={() => setCopiedTitle(null)} title="Template copied!" copySuccess>
        {copiedTitle} is ready to personalize and send.
      </BaseAlert>
    </section>
  );
}
