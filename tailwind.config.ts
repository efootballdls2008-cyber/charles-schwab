import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        'md2': '844px',
      },
      colors: {
        primary: '#a28539',
        secondary: '#2b1978',
        accent: '#a28539',
        warning: '#F59E0B',
        danger: '#EF4444',
        dark: {
          100: '#1e1540',
          200: '#160f35',
          300: '#110b2d',
          400: '#0d0824',
          500: '#08051a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
