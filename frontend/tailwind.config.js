/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "monospace"],
      },
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 40px -8px rgba(56, 189, 248, 0.35)',
      },
    },
  },
  plugins: [],
}
