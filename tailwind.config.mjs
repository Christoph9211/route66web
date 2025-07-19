/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',        // or 'class'
  theme: {
    extend: {
      colors: {
        primary:  '#1D4ED8',
        secondary:'#10B981',
        accent:   '#FBBF24',
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};