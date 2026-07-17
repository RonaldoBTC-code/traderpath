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
          base: "#EAF4FE",
          surface: "#FFFFFF",
          "surface-alt": "#F1F8FF",
          border: "#C9DCEF",
          text: "#1E2A44",
          "text-muted": "#5D6E8C",
          gold: "#E5960A",
          "gold-muted": "#A66B00",
          demand: "#16A34A",
          supply: "#DC2626",
          warning: "#D97706",
          info: "#2563EB",
          // Market cities
          crypto: "#F7931A",
          forex: "#0096C7",
          stocks: "#16A34A",
          commodities: "#CA8A04",
          indices: "#6366F1",
          futures: "#EA580C",
          etfs: "#0891B2",
        },
      },
      fontFamily: {
        display: ["Baloo 2", "DM Sans", "sans-serif"],
        body: ["DM Sans", "-apple-system", "sans-serif"],
        data: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      boxShadow: {
        gold: "0 6px 20px rgba(229, 150, 10, 0.22)",
        demand: "0 6px 20px rgba(22, 163, 74, 0.2)",
        supply: "0 6px 20px rgba(220, 38, 38, 0.2)",
        info: "0 6px 20px rgba(37, 99, 235, 0.2)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "dash-flow": "dash-flow 1s linear infinite",
        "bounce-in": "bounce-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
