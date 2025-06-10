module.exports = {
  darkMode: 'media',
  content: ['./index.html', './app.jsx', './public/**/*.{html,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F0F9A',
        secondary: '#45b34b',
        accent: '#3A9A2A',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
};
