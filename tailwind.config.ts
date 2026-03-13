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
        moti: {
          bg: "#0a0a0f",
          surface: "#14141c",
          border: "#2a2a3a",
          accent: "#6366f1",
          accentDim: "#4f46e5",
          success: "#22c55e",
          text: "#e4e4e7",
          textDim: "#a1a1aa",
        },
      },
    },
  },
  plugins: [],
};

export default config;
