"use client";

import { ThemeProvider } from "@mui/material/styles";
import MuiRegistry from "@/src/app/MuiRegistry";
import theme from "../lib/theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MuiRegistry>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </MuiRegistry>
  );
}
