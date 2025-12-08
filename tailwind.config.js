/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'serif': ['Georgia', 'serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#4169E1',
          50: '#F0F4FF',
          100: '#E1E9FF',
          500: '#4169E1',
          600: '#3A5FCD',
          700: '#2F4F9F',
        }
      }
    },
  },
  plugins: [],
}
