/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Olive Green Palette (Primary)
        olive: {
          50: '#F4F7EE',
          100: '#E9EFDA', // Soft Olive
          200: '#D2DFC3',
          300: '#B0C696',
          400: '#8FA968',
          500: '#667A3A', // Primary Olive
          600: '#4F6228', // Dark Olive
          700: '#3D4C1F',
          800: '#2C3716',
          900: '#1B220E',
        },
        // Deep Navy Blue Palette (Secondary)
        navy: {
          50: '#E8F1FA', // Soft Blue
          100: '#C7DCF2',
          200: '#94BBE2',
          300: '#6098D0',
          400: '#3477BD',
          500: '#102A43', // Primary Navy
          600: '#0C2136',
          700: '#071A2B', // Deep Navy
          800: '#05111D',
          900: '#02080E',
        },
        // Warm Off-White / Ivory Background & Surfaces
        ivory: {
          50: '#FAFBF7',
          100: '#F7F8F4', // Base Ivory Background
          200: '#EFEFEA',
          300: '#E2E3DC',
        },
        // Semantic Status Colors
        status: {
          success: '#2E7D32',
          'success-bg': '#E8F5E9',
          warning: '#B7791F',
          'warning-bg': '#FEF8E7',
          error: '#C62828',
          'error-bg': '#FFEBEE',
          info: '#0288D1',
          'info-bg': '#E1F5FE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 42, 67, 0.05), 0 1px 2px 0 rgba(16, 42, 67, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(16, 42, 67, 0.08), 0 8px 10px -6px rgba(16, 42, 67, 0.04)',
        'modal': '0 20px 25px -5px rgba(7, 26, 43, 0.2), 0 10px 10px -5px rgba(7, 26, 43, 0.1)',
      },
    },
  },
  plugins: [],
}
