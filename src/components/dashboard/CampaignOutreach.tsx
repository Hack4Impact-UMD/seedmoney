"use client";


import { useState } from "react";
import { Alert, Button } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import BaseModal from "@/src/components/bases/BaseModal";
import BaseAlert from "@/src/components/bases/BaseAlert";
import { fillOutreachPlaceholders, outreachTemplates, type OutreachTemplate } from "@/src/lib/campaign-outreach";

export default function CampaignOutreach() {
  const [preview, setPreview] = useState<OutreachTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<
    Record<string, Record<string, string>>
  >({});
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  function openTemplate(template: OutreachTemplate) {
    setCopyError(null);
    setPreview(template);
  }

  function updateTemplateValue(template: OutreachTemplate, token: string, value: string) {
    setTemplateValues((currentValues) => ({
      ...currentValues,
      [template.id]: {
        ...currentValues[template.id],
        [token]: value,
      },
    }));
  }

  function renderEditableText(text: string, template: OutreachTemplate) {
    const values = templateValues[template.id] ?? {};
    const parts: React.ReactNode[] = [];
    const placeholderPattern = /\[([^\]]+)\]/g;
    let lastIndex = 0;

    for (const match of text.matchAll(placeholderPattern)) {
      const [placeholder, token] = match;
      const index = match.index;

      if (index > lastIndex) {
        parts.push(text.slice(lastIndex, index));
      }

      parts.push(
        <input
          key={`${template.id}-${index}`}
          type="text"
          aria-label={token}
          placeholder={token}
          value={values[token] ?? ""}
          onChange={(event) =>
            updateTemplateValue(template, token, event.target.value)
          }
          className="mx-0.5 inline-block max-w-full rounded border border-black bg-white px-1.5 py-0.5 align-baseline text-sm font-normal text-[#333333] placeholder:text-[#666666] focus:outline-2 focus:outline-[#2D7A45]"
          style={{ width: `min(${Math.max(Math.min(token.length + 2, 28), 8)}ch, 100%)` }}
        />,
      );
      lastIndex = index + placeholder.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }

  async function copyTemplate(
    template: OutreachTemplate,
    values: Record<string, string>,
  ) {
    setCopyError(null);
    try {
      const subject = fillOutreachPlaceholders(template.subject, values);
      const body = fillOutreachPlaceholders(template.body, values);
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
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
            Open a template to fill in its bracketed fields, preview your personalized message, and copy it to send using your own email.
            All nine templates are available whenever you need them.
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
                <Button variant="outlined" size="small" startIcon={<VisibilityOutlinedIcon />} aria-label={`Preview ${template.title}`} onClick={() => openTemplate(template)}>
                  Preview
                </Button>
                <Button variant="contained" size="small" startIcon={<ContentCopyIcon />} aria-label={`Personalize and copy ${template.title}`} onClick={() => openTemplate(template)}>
                  Personalize &amp; Copy
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
            <p className="mb-3 text-sm leading-6 text-[#666666]">
              Fill in the highlighted fields right in the message. Repeated fields update together.
            </p>
            <p className="text-sm font-bold text-[#666666]">Subject line</p>
            <p className="mt-1 select-text font-semibold"> {renderEditableText(preview.subject, preview)} </p>
            <p className="mb-2 mt-5 text-sm font-bold text-[#666666]">Message</p>
            <div className="select-text whitespace-pre-wrap text-sm leading-6 text-[#333333]"> {renderEditableText(preview.body, preview)} </div>
            <div className="mt-5 rounded-lg bg-[#EDF7ED] p-4">
              <h3 className="font-bold">Coaching tip</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#666666]">{preview.coaching}</p>
            </div>
            {copyError && <Alert severity="error" className="mt-4">{copyError}</Alert>}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button variant="outlined" size="small" onClick={closePreview}>Close</Button>
              <Button variant="contained" size="small" startIcon={<ContentCopyIcon />} onClick={() => void copyTemplate( preview, templateValues[preview.id] ?? {}, ) } >
                Copy to Clipboard
              </Button>
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
