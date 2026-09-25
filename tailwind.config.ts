import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F4F6F3",
        ink: "#142420",
        brand: {
          DEFAULT: "#0E5C52",
          light: "#E6F0EE",
          dark: "#0A423B",
        },
        signal: {
          DEFAULT: "#E39A2D",
          light: "#FCEFD9",
          dark: "#B87A1F",
        },
        line: "#DCE3DD",
        verified: {
          DEFAULT: "#3F7D4C",
          light: "#E6F1E7",
        },
        danger: {
          DEFAULT: "#B3452F",
          light: "#F7E7E2",
        },
        paper: "#FFFFFF",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        floating: "0 8px 24px -8px rgba(20, 36, 32, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
