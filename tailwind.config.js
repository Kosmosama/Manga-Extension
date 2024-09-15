/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './scripts/**/*.js'],
  theme: {
    extend: {
      colors:{
        "light": {
          "primary": "#FFFFFF",
          "secondary": "#F5F5F5",
          "primary-text": "#191919",
          "secondary-text": "#A1A1A1",
          "border": "#E5E5E5",
          "red": "#EB2828",
          "highlight-primary": "#191919",
          "highlight-text": "#FFFFFF"
        },
        "dark": {
          "primary": "#2D2D2D",
          "secondary": "#191919",
          "primary-text": "#FFFFFF",
          "secondary-text": "#717171",
          "border": "#474747",
          "red": "#800101",
          "highlight-primary": "#FFFFFF",
          "highlight-text": "#191919"
        }
      }
    },
  },
  darkMode:"class",
  plugins: [],
};