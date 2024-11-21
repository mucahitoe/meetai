/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0A0D0C',
          secondary: '#111816',
        },
        primary: {
          DEFAULT: '#1DB9A6',
          hover: '#25D4BE',
        },
        secondary: {
          DEFAULT: '#1A1F1D',
          hover: '#232A27',
        },
        accent: {
          DEFAULT: '#FF69B4',
          hover: '#FF8BC4',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
        }
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
};