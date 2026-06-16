/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          50: "#f5f3ef",
          100: "#e8e4dc",
          200: "#d4cec2",
          300: "#b8b0a0",
          400: "#9a9080",
          500: "#7d7366",
          600: "#635b52",
          700: "#4a4540",
          800: "#332f2c",
          900: "#1a1a2e",
          950: "#0f0f1a",
        },
        gold: {
          50: "#fdf8e7",
          100: "#faefc9",
          200: "#f4df8d",
          300: "#edca55",
          400: "#e6b830",
          500: "#d4af37",
          600: "#b88d2a",
          700: "#996924",
          800: "#7d5323",
          900: "#684521",
        },
        ivory: {
          50: "#fdfcfa",
          100: "#f9f6f0",
          200: "#f5f0e8",
          300: "#eee6d8",
          400: "#e0d4c0",
          500: "#cebfa5",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Noto Sans SC'", "sans-serif"],
      },
      boxShadow: {
        gold: "0 4px 20px rgba(212, 175, 55, 0.15)",
        "gold-lg": "0 8px 30px rgba(212, 175, 55, 0.2)",
        card: "0 2px 12px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.12)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        "number-roll": "numberRoll 0.8s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(212, 175, 55, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.6)" },
        },
        numberRoll: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
