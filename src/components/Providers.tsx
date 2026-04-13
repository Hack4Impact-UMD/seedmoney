"use client";

import { ThemeProvider } from "@mui/material/styles";
import MuiRegistry from "@/src/app/MuiRegistry";
import QueryProvider from "@/src/providers/QueryProvider";
import theme from "../lib/theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MuiRegistry>
      <QueryProvider>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </QueryProvider>
    </MuiRegistry>
  );
}
