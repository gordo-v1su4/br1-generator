/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slate': {
          750: '#1e293b',
          850: '#0f172a',
        },
      },
      keyframes: {
        'progress-infinite': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'fill-gradient': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'gradient': {
          '0%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          },
          '100%': {
            'background-position': '0% 50%'
          }
        },
        'progress-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'progress-infinite': 'progress-infinite 2s linear infinite',
        'fill-gradient': 'fill-gradient 2s ease-out forwards',
        'progress-bar': 'progress-bar 2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}