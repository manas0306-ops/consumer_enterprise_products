/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rangoli: {
          50: '#FAF5EB',
          100: '#F5E7CC',
          200: '#EBD096',
          300: '#E1B85F',
          400: '#D7A137',
          500: '#C88A24', // Primary Indian Rangoli Saffron Gold
          600: '#A46F1C',
          700: '#7E5316',
          800: '#5A3A11',
          900: '#3D250A',
        },
        earth: {
          50: '#F8F6F4',
          100: '#ECE6E0',
          200: '#D5C7BD',
          300: '#B6A092',
          400: '#8A7162',
          500: '#644F42',
          600: '#4E3C32',
          700: '#3A2B23',
          800: '#2A1E18',
          900: '#1A120E', // Deep charcoal / dark brown text
        },
        ivory: {
          50: '#FDFBF7', // Dominant background
          100: '#FAF6EE',
          200: '#F3ECE0',
          300: '#E8DCB8',
          400: '#DAC895',
        },
        success: '#1B7A43',
        warning: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        'rangoli': '0 4px 20px -2px rgba(200, 138, 36, 0.12), 0 2px 6px -1px rgba(61, 37, 10, 0.06)',
        'rangoli-lg': '0 10px 30px -4px rgba(200, 138, 36, 0.18), 0 4px 12px -2px rgba(61, 37, 10, 0.08)',
        'rangoli-glow': '0 0 25px rgba(200, 138, 36, 0.35)',
      },
      animation: {
        'mandala-spin-slow': 'spin 60s linear infinite',
        'mandala-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
