import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          900: "#142A19",
          800: "#123A1E",
          700: "#207A45",
          600: "#56BD60",
        },
        text:{
          primary: "#000000",
          secondary: "#666666",
          white: "#FFFFFF",
        },
        rank: {
          gold:   "#F8BF24",
          silver: "#B5B5B5",
          bronze: "#FF7F29",
          other:  "#56BD60",
        },
      },
    },
  },
};

export default config;