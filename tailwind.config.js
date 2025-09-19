/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', 600: '#2563EB', 700: '#1D4ED8' },
        surface: { 0: '#FFFFFF', 50: '#FAFAFA', 100: '#F5F5F5' },
        text: { primary: '#111827', secondary: '#4B5563', muted: '#6B7280', inverse: '#FFFFFF' },
        border: { subtle: '#E5E7EB', strong: '#D1D5DB' }
      },
      borderRadius: { xl: '16px', '2xl': '20px' },
      boxShadow: { sheet: '0 -8px 24px rgba(0,0,0,0.08)', card: '0 6px 18px rgba(0,0,0,0.08)', press: '0 2px 8px rgba(0,0,0,0.10)' }
    }
  },
  plugins: []
}
