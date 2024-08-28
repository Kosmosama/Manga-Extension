/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/index.html', './src/**/*.js'],
  theme: {
    extend: {
      colors:{
        "primary": {
          DEFAULT:"#EEEDEB",
          500: "#EEEDEB"
        }
 
      }
    },
  },
  plugins: [],
  darkMode: "class",
}