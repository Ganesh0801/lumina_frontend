/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Nunito', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#FFFBEB', 100: '#FFF8E1', 200: '#F5E0A0', 300: '#D4AA4A',
          400: '#C9A227', 500: '#B8860B', 600: '#8B6000', 700: '#7a5200',
        },
        cream: { DEFAULT: '#F7F5F0', light: '#FDFBF5', dark: '#EDE9DF' },
        dark: {
          50: '#1C1C1C', 100: '#2A2A2A', 200: '#3A3A3A', 300: '#6B6B6B',
          400: '#888888', 500: '#ABABAB', 600: '#CDCDCD', 700: '#EBEBEB',
          800: '#F3F1ED', 900: '#F7F5F0',
        },
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
      boxShadow: {
        'gold': '0 6px 20px rgba(184,134,11,0.30)',
        'card': '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 32px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
};
