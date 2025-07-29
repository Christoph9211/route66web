// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app.jsx"
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        dark: {
          primary: "#3B82F6", // Blue-500
          secondary: "#34D399", // Green-500
          accent: "#FBBF24", // Amber-400
          background: "#111827", // Gray-900
          text: "#F9FAFB", // Gray-50
        },
        light: {
          primary: "#1D4ED8", // Blue-600
          secondary: "#34D399", // Green-500
          accent: "#FBBF24", // Amber-400
          background: "#F9FAFB", // Gray-50
          text: "#111827", // Gray-900
        },
      },
      fontFamily: {
        sans: ["Inter", "Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
