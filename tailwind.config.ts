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
        wildwoods: {
          slate: "#141E19",
          forest: "#1D2D25",
          moss: "#2A4034",
          sage: "#4D7C5D",
          mint: "#A3C9B0",
          cream: "#FBF9F5",
          parchment: "#F3EFE6",
          sand: "#E6DEC8",
          amber: "#D97706",
          gold: "#F59E0B",
          coral: "#C2410C",
          crimson: "#991B1B"
        }
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
