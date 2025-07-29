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
      
      fontFamily: {
        sans: ["Inter", "Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
