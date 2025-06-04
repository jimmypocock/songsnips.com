import type { Config } from "tailwindcss";

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Modern color palette
        primary: {
          DEFAULT: "#012f49",    // Deep Navy
          hover: "#023e5f",
        },
        secondary: {
          DEFAULT: "#2196F3",  // Bright Blue - now secondary
          hover: "#1976D2",
        },
        accent: {
          DEFAULT: "#f77f00",     // Vibrant Orange - now accent for small highlights
          hover: "#e06f00",
        },
        danger: {
          DEFAULT: "#ef4444",     // Red
          hover: "#dc2626",
        },
        neutral: {
          DEFAULT: "#6b7280",    // Gray
          hover: "#4b5563",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;