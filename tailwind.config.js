/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'h100-bg': '#0a0e1a',
        'h100-cyan': '#00d4ff',
        'h100-emerald': '#00ff9d',
        'h100-purple': '#a855f7',
        'h100-amber': '#fbbf24'
      }
    },
  },
  plugins: [],
}
