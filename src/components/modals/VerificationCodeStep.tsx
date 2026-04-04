"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type VerificationCodeStepProps = {
  message: string;
  code: string;
  onCodeChange: (value: string) => void;
  error: string | null;
  onResend: () => void;
};

export default function VerificationCodeStep({
  message,
  code,
  onCodeChange,
  error,
  onResend,
}: VerificationCodeStepProps) {
  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {message}
      </Typography>
      <TextField
        variant="outlined"
        fullWidth
        label="Enter Verification Code"
        placeholder="Enter code"
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        error={!!error}
        helperText={error}
        sx={{ mb: 1 }}
      />
      <Typography variant="body2" sx={{ color: "#666" }}>
        Link expired or didn&apos;t receive it?{" "}
        <Button
          variant="text"
          onClick={onResend}
          sx={{
            color: "#00A63E",
            textDecoration: "underline",
            fontWeight: 600,
            p: 0,
            minWidth: "auto",
            verticalAlign: "baseline",
            textTransform: "none",
            fontSize: "inherit",
            lineHeight: "inherit",
            "&:hover": {
              textDecoration: "underline",
              backgroundColor: "transparent",
            },
          }}
        >
          Resend
        </Button>
      </Typography>
    </Box>
  );
}
