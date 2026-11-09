"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import BaseModal from "@/src/components/bases/BaseModal";

interface EmailLinkModalProps {
  open: boolean;
  editor: Editor;
  onClose: () => void;
}

// Adds https:// when the admin types a bare domain like "seedmoney.org".
// A token like {{campaign_url}} is left as is; it's filled in per recipient.
function normalizeUrl(input: string) {
  const url = input.trim();
  if (!url) return "";
  return /^(https?:|mailto:|\{\{)/i.test(url) ? url : `https://${url}`;
}

export default function EmailLinkModal({
  open,
  editor,
  onClose,
}: EmailLinkModalProps) {
  return (
    <BaseModal open={open} onClose={onClose} title="Insert link">
      {/* Mounting the form only while open resets it each time it opens */}
      {open && <LinkForm editor={editor} onClose={onClose} />}
    </BaseModal>
  );
}

function LinkForm({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const isEditingLink = editor.isActive("link");
  const [url, setUrl] = useState<string>(
    isEditingLink ? (editor.getAttributes("link").href ?? "") : "",
  );

  const handleSave = () => {
    const href = normalizeUrl(url);
    const chain = editor.chain().focus().extendMarkRange("link");

    if (!href) {
      chain.unsetLink().run();
    } else if (editor.state.selection.empty && !isEditingLink) {
      // Nothing selected: insert the URL itself as the link text
      chain
        .insertContent({
          type: "text",
          text: href,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    } else {
      chain.setLink({ href }).run();
    }

    onClose();
  };

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSave();
      }}
    >
      <TextField
        autoFocus
        fullWidth
        size="small"
        label="URL"
        placeholder="https://seedmoney.org or {{campaign_url}}"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />

      <div className="mt-5 flex w-full flex-row justify-end">
        {isEditingLink && (
          <Button
            variant="outlined"
            size="small"
            className="!mr-auto !border-none !text-[#F04438]"
            onClick={handleRemove}
          >
            Remove link
          </Button>
        )}
        <Button
          variant="outlined"
          size="small"
          className="!border-none !text-[#666666]"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          className="!ml-3"
        >
          Save
        </Button>
      </div>
    </form>
  );
}
