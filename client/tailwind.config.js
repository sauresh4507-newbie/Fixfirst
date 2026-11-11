/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bbfc',
          400: '#8195f8',
          500: '#6272f1',
          600: '#4f56e5',
          700: '#4244cf',
          800: '#3638a8',
          900: '#303584',
          950: '#1e1e54',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8f9fc',
          tertiary: '#f1f3f9',
          border: '#e4e8f0',
          'border-strong': '#c9cfdb',
        },
        ink: {
          DEFAULT: '#0f1117',
          secondary: '#3d4354',
          tertiary: '#6b7285',
          placeholder: '#9ca3b5',
          disabled: '#b8bdc9',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6272f1 0%, #8b5cf6 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%)',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(98, 114, 241, 0.15) 0%, transparent 60%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      },
      boxShadow: {
        'xs':      '0 1px 2px 0 rgba(15, 17, 23, 0.05)',
        'sm':      '0 1px 3px 0 rgba(15, 17, 23, 0.07), 0 1px 2px -1px rgba(15, 17, 23, 0.07)',
        'md':      '0 4px 6px -1px rgba(15, 17, 23, 0.07), 0 2px 4px -2px rgba(15, 17, 23, 0.05)',
        'lg':      '0 10px 15px -3px rgba(15, 17, 23, 0.07), 0 4px 6px -4px rgba(15, 17, 23, 0.05)',
        'xl':      '0 20px 25px -5px rgba(15, 17, 23, 0.08), 0 8px 10px -6px rgba(15, 17, 23, 0.05)',
        '2xl':     '0 25px 50px -12px rgba(15, 17, 23, 0.18)',
        'brand':   '0 4px 14px 0 rgba(98, 114, 241, 0.35)',
        'brand-lg':'0 8px 30px 0 rgba(98, 114, 241, 0.4)',
        'inner-brand': 'inset 0 1px 0 rgba(255,255,255,0.15)',
        'glow':    '0 0 0 3px rgba(98, 114, 241, 0.12)',
        'glow-brand': '0 0 20px rgba(98, 114, 241, 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in':        'fadeIn 0.25s ease-out',
        'fade-up':        'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-down':      'fadeDown 0.25s ease-out',
        'slide-up':       'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':       'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'float':          'float 3.5s ease-in-out infinite',
        'float-slow':     'floatSlow 6s ease-in-out infinite',
        'shimmer':        'shimmer 1.5s infinite linear',
        'pulse-ring':     'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':      'spinSlow 12s linear infinite',
        'gradient':       'gradientShift 4s ease infinite',
        'border-spin':    'borderSpin 3s linear infinite',
        'orb-float':      'orbFloat 8s ease-in-out infinite',
        'live-pulse':     'livePulse 2s ease-in-out infinite',
        'cursor-blink':   'cursorBlink 1s step-end infinite',
        'count-glow':     'countGlow 0.6s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%':      { boxShadow: '0 0 0 0 rgba(98, 114, 241, 0.4)' },
          '70%':     { boxShadow: '0 0 0 8px rgba(98, 114, 241, 0)' },
          '100%':    { boxShadow: '0 0 0 0 rgba(98, 114, 241, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      height: {
        'dvh':  '100dvh',
        'svh':  '100svh',
        'lvh':  '100lvh',
        'screen': '100dvh', // override default vh with dvh
      },
      minHeight: {
        'dvh':   '100dvh',
        'screen': '100dvh',
      },
      maxHeight: {
        'dvh':  '100dvh',
        'screen': '100dvh',
      },
      spacing: {
        /* bottom-nav height token so we can use it as a spacing value */
        'bottom-nav': 'var(--bottom-nav-h)',
        'safe-top':    'var(--safe-top)',
        'safe-bottom': 'var(--safe-bottom)',
      },
    },
  },
  plugins: [],
}
