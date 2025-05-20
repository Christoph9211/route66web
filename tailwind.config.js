/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"],
  darkMode: "media", // Enable dark mode based on user's system preference
  theme: {
    extend: {
      colors: {
        primary: "#0F0F9A", // Darkened for better contrast
        secondary: "#45b34b", // Darkened for better contrast
        accent: "#3A9A2A", // Updated accent color for better contrast
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
  plugins: [],
    },
  },
};
