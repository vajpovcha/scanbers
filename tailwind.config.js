/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lao: {
          red: '#CE1126',
          blue: '#002868',
          sky: '#0072CE',
        },
      },
      fontFamily: {
        lao: ['"Noto Sans Lao"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
