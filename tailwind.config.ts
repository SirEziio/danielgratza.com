import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-primary)", "Futura PT", "Trebuchet MS", "sans-serif"],
      },
      colors: {
        lime: "#C5D100",
      },
    },
  },
  plugins: [],
};

export default config;
