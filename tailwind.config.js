/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-first touch targets (min 48px)
      spacing: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
