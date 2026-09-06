/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rgukt: {
          navy: '#0b1d33',     // Deep authoritative RGUKT navy
          primary: '#0f3b6c',  // Deep rich royal blue
          accent: '#b45309',   // Warm institutional amber/gold
          light: '#e8f1fb',    // Soft high-contrast light blue surface
          border: '#b9d5f3',
        },
        brand: {
          50: '#eef6fc',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#3b82f6',
          500: '#1d4ed8',
          600: '#0f3b6c',
          700: '#0c2e55',
          800: '#092341',
          900: '#07182d',
        },
      },
    },
  },
  plugins: [],
}
