/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**.{html,css,js}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require('daisyui')
  ],
}

