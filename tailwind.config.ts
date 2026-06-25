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
          base: "#0A0E1A",
          surface: "#131827",
          "surface-alt": "#1C2233",
          border: "#1E2D45",
          text: "#E8EAF0",
          "text-muted": "#8894A8",
          gold: "#F0C040",
          "gold-muted": "#B8922E",
          demand: "#22C55E",
          supply: "#EF4444",
          warning: "#F59E0B",
          info: "#60A5FA",
          // Market cities
          crypto: "#F7931A",
          forex: "#00B4D8",
          stocks: "#22C55E",
          commodities: "#EAB308",
          indices: "#818CF8",
          futures: "#F97316",
          etfs: "#06B6D4",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["DM Sans", "-apple-system", "sans-serif"],
        data: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      boxShadow: {
        gold: "0 4px 24px rgba(240, 192, 64, 0.15)",
        demand: "0 4px 24px rgba(34, 197, 94, 0.15)",
        supply: "0 4px 24px rgba(239, 68, 68, 0.15)",
        info: "0 4px 24px rgba(96, 165, 250, 0.15)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "dash-flow": "dash-flow 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
