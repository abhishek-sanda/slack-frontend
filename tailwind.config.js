/** @type {import('tailwindcss').Config} */
module.exports = {
   darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
         colors: {
        reading: "#f7ecd9", // Sepia (reading mode)
      }
    },
  },
  plugins: [],
}