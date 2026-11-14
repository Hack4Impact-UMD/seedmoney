"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { DataObject, ExpandMore } from "@mui/icons-material";
import {
  EMAIL_TOKENS,
  type EmailTokenKey,
} from "@/src/components/email/emailTokens";

interface EmailTokenMenuProps {
  onInsert: (key: EmailTokenKey) => void;
  className?: string;
}

// Personalization: replaced with each recipient's own value on send
export default function EmailTokenMenu({ onInsert, className }: EmailTokenMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        className={className}
        startIcon={<DataObject sx={{ fontSize: 16 }} />}
        endIcon={<ExpandMore sx={{ fontSize: 18 }} />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="menu"
        sx={{ py: 0.25, textTransform: "none", letterSpacing: 0, whiteSpace: "nowrap" }}
      >
        Insert token
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        // Keep the cursor in the editor instead of returning focus to the button
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {EMAIL_TOKENS.map(({ key, label }) => (
          <MenuItem
            key={key}
            onClick={() => {
              onInsert(key);
              setAnchorEl(null);
            }}
            sx={{ fontSize: 13 }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
