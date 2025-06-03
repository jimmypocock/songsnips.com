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
        // Add your brand colors here
        primary: "#9436eb",
        secondary: "#2196f3", 
        accent: "#ec4899",
        neutral: "#9ca3af",
      },
    },
  },
  plugins: [],
} satisfies Config;