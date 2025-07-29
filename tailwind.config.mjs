// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app.jsx",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        light: {
          primary: "#1D4ED8", // Blue-600
          secondary: "#10B981", // Green-500
          accent: "#FBBF24", // Amber-400
          text: "#111827", // Gray-900
          background: "#F9FAFB", // Gray-50
        },
        dark: {
          primary: "#3B82F6", // Blue-500
          secondary: "#10B981", // Green-500
          accent: "#FBBF24", // Amber-400
          text: "#F9FAFB", // Gray-50
          background: "#111827", // Gray-900
        },
      },
      fontFamily: {
        sans: ["Inter", "Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
