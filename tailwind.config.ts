import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        hospital: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        tv: {
          bg: "#07131e",
          surface: "#0f2334",
          card: "#142d42",
          cardHover: "#1b3c57",
          border: "#1f4769",
          accent: "#38bdf8",
          accentGlow: "#0284c7",
          text: "#f8fafc",
          textMuted: "#94a3b8",
        },
      },
      fontSize: {
        "tv-sm": ["1.125rem", "1.75rem"],
        "tv-base": ["1.375rem", "2rem"],
        "tv-lg": ["1.75rem", "2.375rem"],
        "tv-xl": ["2.25rem", "2.875rem"],
        "tv-2xl": ["2.875rem", "3.375rem"],
        "tv-3xl": ["3.75rem", "4.25rem"],
      },
      boxShadow: {
        "tv-focus": "0 0 0 5px #38bdf8, 0 10px 25px -5px rgba(2, 132, 199, 0.5)",
        "tv-focus-warning": "0 0 0 5px #facc15, 0 10px 25px -5px rgba(234, 179, 8, 0.5)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.95)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.4" },
          "100%": { transform: "scale(0.95)", opacity: "1" },
        },
        soundWave: {
          "0%, 100%": { height: "12px" },
          "50%": { height: "42px" },
        },
      },
      animation: {
        pulseRing: "pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        soundWave: "soundWave 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
