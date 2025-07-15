export default {
  darkMode: 'media',
  content: ['./index.html', './app.jsx', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',
        secondary: '#10B981',
        accent: '#FBBF24'
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'sans-serif']
      }
    }
  }
};
