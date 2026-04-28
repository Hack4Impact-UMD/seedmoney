import { createTheme } from "@mui/material/styles";


declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    approved: true;
    denied: true;
    pending: true;
    published: true;
    in_progress: true;
    publish_failed: true;
    archived: true;
  }
}


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
            backgroundColor: "#2D7A45",
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
            backgroundColor: "#2D7A45",
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
            backgroundColor: "#2D7A45",
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
            borderColor: "#123A1E",
            color: "#123A1E",
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
            borderColor: "#123A1E",
            color: "#123A1E",
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
            borderColor: "#123A1E",
            color: "#123A1E",
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
          props: { variant: "outlined" },
          style: {
            backgroundColor: "#EDF7ED",
            color: "#1e4620",
            border: "none",
            width: "320px",
            fontWeight: 400,
          },
        },
      ],
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-Lato), sans-serif",
          fontWeight: 400,
          borderRadius: "999px",
          fontSize: "13px",
          height: "32px",
          paddingInline: "4px",
        },
      },
      variants: [
        { props: { variant: "approved" },       style: { border: "1px solid #1976D2", color: "#1976D2", backgroundColor: "#FFFFFF" } },
        { props: { variant: "archived" },       style: { border: "1px solid #A6A6A6", color: "#A6A6A6", backgroundColor: "#FFFFFF" } },
        { props: { variant: "denied" },         style: { border: "1px solid #FF8C29", color: "#FF8C29", backgroundColor: "#FFFFFF" } },
        { props: { variant: "in_progress" },    style: { border: "1px solid #6A7282", color: "#6A7282", backgroundColor: "#FFFFFF" } },
        { props: { variant: "pending" },        style: { border: "1px solid #883280", color: "#883280", backgroundColor: "#FFFFFF" } },
        { props: { variant: "publish_failed" }, style: { border: "1px solid #D32F2F", color: "#D32F2F", backgroundColor: "#FFFFFF" } },
        { props: { variant: "published" },      style: { border: "1px solid #2D7A45", color: "#2D7A45", backgroundColor: "#FFFFFF" } },
      ],
    },
  },
});

export default theme;