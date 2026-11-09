"use client";

import { useState } from "react";
import clsx from "clsx";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import {
  DataObject,
  ExpandMore,
  FormatAlignCenter,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatUnderlined,
  InsertLink,
} from "@mui/icons-material";
import EmailLinkModal from "@/src/components/email/EmailLinkModal";
import { EMAIL_TOKEN_NODE } from "@/src/components/email/emailTokenNode";
import {
  EMAIL_TOKENS,
  type EmailTokenKey,
} from "@/src/components/email/emailTokens";

type BlockStyle = "paragraph" | "h1" | "h2" | "h3";
type Alignment = "left" | "center" | "right";

const BLOCK_STYLES: { value: BlockStyle; label: string }[] = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
];

const ALIGNMENTS: { value: Alignment; label: string; Icon: typeof FormatAlignLeft }[] = [
  { value: "left", label: "Align left", Icon: FormatAlignLeft },
  { value: "center", label: "Align center", Icon: FormatAlignCenter },
  { value: "right", label: "Align right", Icon: FormatAlignRight },
];

interface ToolbarButtonProps {
  label: string;
  isActive?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

function ToolbarButton({ label, isActive, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      onClick={onClick}
      className={clsx(
        "flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-colors",
        isActive
          ? "bg-[#DCEFE1] text-[#123A1E]"
          : "text-gray-600 hover:bg-gray-200",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />;
}

export default function EmailToolbar({ editor }: { editor: Editor }) {
  const [alignAnchorEl, setAlignAnchorEl] = useState<HTMLElement | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [tokenAnchorEl, setTokenAnchorEl] = useState<HTMLElement | null>(null);

  const insertToken = (key: EmailTokenKey) => {
    editor
      .chain()
      .focus()
      .insertContent({ type: EMAIL_TOKEN_NODE, attrs: { key } })
      .run();
    setTokenAnchorEl(null);
  };

  // Re-render the toolbar whenever the cursor moves or formatting changes
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      blockStyle: (editor.isActive("heading", { level: 1 })
        ? "h1"
        : editor.isActive("heading", { level: 2 })
          ? "h2"
          : editor.isActive("heading", { level: 3 })
            ? "h3"
            : "paragraph") as BlockStyle,
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isLink: editor.isActive("link"),
      alignment: (ALIGNMENTS.find(({ value }) =>
        editor.isActive({ textAlign: value }),
      )?.value ?? "left") as Alignment,
    }),
  });

  const setBlockStyle = (style: BlockStyle) => {
    const chain = editor.chain().focus();
    if (style === "paragraph") {
      chain.setParagraph().run();
    } else {
      const level = Number(style.slice(1)) as 1 | 2 | 3;
      chain.setHeading({ level }).run();
    }
  };

  const setAlignment = (alignment: Alignment) => {
    editor.chain().focus().setTextAlign(alignment).run();
    setAlignAnchorEl(null);
  };

  const CurrentAlignIcon =
    ALIGNMENTS.find(({ value }) => value === state.alignment)?.Icon ??
    FormatAlignLeft;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-[#F6FAF9] px-2 py-1.5">
      <Select
        size="small"
        value={state.blockStyle}
        onChange={(event) => setBlockStyle(event.target.value as BlockStyle)}
        inputProps={{ "aria-label": "Text style" }}
        sx={{
          height: 28,
          fontSize: 13,
          backgroundColor: "#fff",
          "& .MuiSelect-select": { py: 0.5, pl: 1.25 },
        }}
      >
        {BLOCK_STYLES.map(({ value, label }) => (
          <MenuItem key={value} value={value} sx={{ fontSize: 13 }}>
            {label}
          </MenuItem>
        ))}
      </Select>

      <Divider />

      <ToolbarButton
        label="Bold"
        isActive={state.isBold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <FormatBold sx={{ fontSize: 18 }} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        isActive={state.isItalic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <FormatItalic sx={{ fontSize: 18 }} />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        isActive={state.isUnderline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <FormatUnderlined sx={{ fontSize: 18 }} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bulleted list"
        isActive={state.isBulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FormatListBulleted sx={{ fontSize: 18 }} />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        isActive={state.isOrderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <FormatListNumbered sx={{ fontSize: 18 }} />
      </ToolbarButton>
      <ToolbarButton
        label="Alignment"
        isActive={state.alignment !== "left"}
        onClick={(event) => setAlignAnchorEl(event.currentTarget)}
      >
        <CurrentAlignIcon sx={{ fontSize: 18 }} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Link"
        isActive={state.isLink}
        onClick={() => setLinkModalOpen(true)}
      >
        <InsertLink sx={{ fontSize: 18 }} />
      </ToolbarButton>

      {/* Personalization: replaced with each recipient's own value on send */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<DataObject sx={{ fontSize: 16 }} />}
        endIcon={<ExpandMore sx={{ fontSize: 18 }} />}
        onClick={(event) => setTokenAnchorEl(event.currentTarget)}
        aria-haspopup="menu"
        sx={{ ml: "auto" }}
      >
        Insert token
      </Button>

      <Menu
        anchorEl={tokenAnchorEl}
        open={Boolean(tokenAnchorEl)}
        onClose={() => setTokenAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {EMAIL_TOKENS.map(({ key, label }) => (
          <MenuItem
            key={key}
            onClick={() => insertToken(key)}
            sx={{ fontSize: 13 }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={alignAnchorEl}
        open={Boolean(alignAnchorEl)}
        onClose={() => setAlignAnchorEl(null)}
      >
        {ALIGNMENTS.map(({ value, label, Icon }) => (
          <MenuItem
            key={value}
            selected={state.alignment === value}
            onClick={() => setAlignment(value)}
            sx={{ fontSize: 13, gap: 1 }}
          >
            <Icon sx={{ fontSize: 18 }} />
            {label}
          </MenuItem>
        ))}
      </Menu>

      <EmailLinkModal
        open={linkModalOpen}
        editor={editor}
        onClose={() => setLinkModalOpen(false)}
      />
    </div>
  );
}
