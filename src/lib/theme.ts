import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-Lato), sans-serif",
  },
  palette: {
    primary: {
      main: "#00A63E",
      dark: "#008030",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          fontWeight: 600,
          letterSpacing: "1.5px",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
      variants: [
        {
          props: { variant: "contained", size: "large" },
          style: {
            backgroundColor: "#008832",
            color: "#fff",
            padding: "16px 32px",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#006F29" },
            "&.Mui-disabled": { backgroundColor: "#E0E0E0", color: "#A6A6A6" },
          },
        },
        {
          props: { variant: "contained", size: "medium" },
          style: {
            backgroundColor: "#008832",
            color: "#fff",
            padding: "12px 26px",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#006F29" },
            "&.Mui-disabled": { backgroundColor: "#E0E0E0", color: "#A6A6A6" },
          },
        },

        {
          props: { variant: "contained", size: "small" },
          style: {
            backgroundColor: "#008832",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#006F29" },
            "&.Mui-disabled": { backgroundColor: "#E0E0E0", color: "#A6A6A6" },
          },
        },
        {
          props: { variant: "outlined", size: "large" },
          style: {
            borderColor: "#008832",
            color: "#008832",
            padding: "16px 32px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "rgba(90, 188, 97, 0.20)", borderColor: "#008030" },
            "&.Mui-disabled": { borderColor: "#A6A6A6", color: "#A6A6A6", backgroundColor:"#FFFFFF"},
          },
        },
        {
          props: { variant: "outlined", size: "medium" },
          style: {
            borderColor: "#008832",
            color: "#008832",
            padding: "12px 26px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "rgba(90, 188, 97, 0.20)", borderColor: "#008030" },
            "&.Mui-disabled": { borderColor: "#A6A6A6", color: "#A6A6A6", backgroundColor:"#FFFFFF"},
          },
        },

        
        {
          props: { variant: "outlined", size: "small" },
          style: {
            borderColor: "#008832",
            color: "#008832",
            padding: "10px 14px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "rgba(90, 188, 97, 0.20)", borderColor: "#008030" },
            "&.Mui-disabled": { borderColor: "#A6A6A6", color: "#A6A6A6", backgroundColor:"#FFFFFF"},
          },
        },

        {
          props: { variant: "text", size: "large" },
          style: {
            color: "#666666",
            padding: "16px 8px",
            "&:hover": { backgroundColor: "rgba(90, 188, 97, 0.20)" },
            "&.Mui-disabled": { color: "#A6A6A6" },
          },
        },
        {
          props: { variant: "text", size: "medium" },
          style: {
            color: "#666666",
            padding: "12px 8px",
            "&:hover": { backgroundColor: "rgba(90, 188, 97, 0.20)" },
            "&.Mui-disabled": { color: "#A6A6A6" },
          },
        },
      ],
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-Lato), sans-serif",
          fontWeight: 600,
          borderRadius: "8px",
        },
      },
      variants: [
        {
          props: { severity: "success", variant: "outlined" },
          style: {
            backgroundColor: "#EDF7ED",
            color: "#1e4620",
            border: "none",
            fontWeight: 400,
          },
        },
      ],
    },
  },
});

export default theme;