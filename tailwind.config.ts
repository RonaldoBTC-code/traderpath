import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tp: {
          "bg-primary": "#0D1B2A",
          "bg-secondary": "#1A2B3C",
          "bg-tertiary": "#0A1628",
          "accent-green": "#00C896",
          "accent-gold": "#FFD700",
          "accent-red": "#FF4757",
          "accent-blue": "#4A90E2",
          "accent-cyan": "#00E5FF",
          "text-primary": "#FFFFFF",
          "text-secondary": "#A0B0C0",
          border: "#2A3F55",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
