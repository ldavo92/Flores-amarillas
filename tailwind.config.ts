import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B192C",
          50: "#1C3454",
          100: "#162941",
          900: "#0B192C",
        },
        accent: {
          DEFAULT: "#1E90FF",
          dark: "#0B6FD6",
        },
        success: {
          DEFAULT: "#2E7D32",
          light: "#4CAF50",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
      },
      spacing: {
        touch: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
