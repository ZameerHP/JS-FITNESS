/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        surface: '#0B0B0C',
        raised: '#121314',
        lime: {
          DEFAULT: '#B6F500',
          deep: '#8FCC00',
          glow: 'rgba(182, 245, 0, 0.45)',
        },
        cream: '#F3EEDC',
        body: '#C9C9C9',
        muted: '#8C8C8C',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Saira Condensed"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        script: ['Yellowtail', 'cursive'],
      },
      maxWidth: {
        container: '1280px',
      },
      boxShadow: {
        lime: '0 0 30px rgba(182, 245, 0, 0.35)',
        'lime-lg': '0 0 50px rgba(182, 245, 0, 0.45)',
      },
    },
  },
  plugins: [],
};
