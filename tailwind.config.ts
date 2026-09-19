import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "var(--brand-50, #fff7ed)",
          100: "var(--brand-100, #ffedd5)",
          500: "var(--brand-500, #f97316)",
          600: "var(--brand-600, #ea580c)",
          700: "var(--brand-700, #c2410c)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
