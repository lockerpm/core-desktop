/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      primary: '#268334'
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  },
}

