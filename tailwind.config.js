/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ev: {
          green: '#00D97E',
          yellow: '#FFB800',
          red: '#FF4757',
          dark: '#0A0E1A',
          card: '#111827',
          border: '#1F2937',
          muted: '#6B7280',
        }
      }
    },
  },
  plugins: [],
}
