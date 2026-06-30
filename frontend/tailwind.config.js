/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#EDE8DF',
          50:  '#F9F7F4',
          100: '#F2EDE4',
          200: '#EDE8DF',
          300: '#E8E2D8',
          400: '#DDD7CC',
          500: '#CEC7BB',
        },
        gold: {
          DEFAULT: '#C9973A',
          light: '#D4A84B',
          dark:  '#A87C2A',
          muted: 'rgba(201,151,58,0.15)',
          border: 'rgba(201,151,58,0.4)',
        },
        sky: {
          brand: '#6CB4E4',
          dark:  '#4A9FD4',
        },
        background: '#EDE8DF',
        surface: {
          1: '#F2EDE4',
          2: '#E8E2D8',
          3: '#DDD7CC',
        },
        ink: {
          0: '#0D0D0D',
          1: '#1A1A1A',
          2: '#5A5248',
          3: '#9A8F82',
        },
        success: '#2D9B6F',
        danger:  '#D94F4F',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        btn:  '8px',
      },
      boxShadow: {
        card:         '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10)',
        gold:         '0 4px 14px rgba(201,151,58,0.25)',
        modal:        '0 20px 60px rgba(0,0,0,0.18)',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        toastIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        fadeUp:  'fadeUp 0.4s ease-out both',
        fadeIn:  'fadeIn 0.3s ease-out both',
        slideIn: 'slideIn 0.35s ease-out both',
        toastIn: 'toastIn 0.35s ease-out both',
      },
    },
  },
  plugins: [],
}

