const { Config } = require("tailwindcss");

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  safelist: [
    "text-green-500",
    "text-green-600",
    "text-red-500",
    "text-red-600",
    "text-blue-500",
    "text-blue-600",
    "text-gray-500",
  ],
  plugins: [],
};

module.exports = config;
