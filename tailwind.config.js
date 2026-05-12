/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF5E6',
          100: '#F5E6C8',
          200: '#EBD08F',
          300: '#D4AA4A',
          400: '#C9A227',
          500: '#B8860B',
          600: '#8B6914',
          700: '#6B5010',
          800: '#4A380A',
          900: '#2A1F05',
        },
        dark: {
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#C8C8C8',
          300: '#A0A0A0',
          400: '#707070',
          500: '#505050',
          600: '#383838',
          700: '#282828',
          800: '#1A1A1A',
          900: '#0F0F0F',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideIn: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow: { '0%': { boxShadow: '0 0 5px #C9A227' }, '100%': { boxShadow: '0 0 20px #C9A227, 0 0 40px #C9A22730' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #8B6914 0%, #C9A227 50%, #D4AA4A 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)',
      }
    },
  },
  plugins: [],
};
