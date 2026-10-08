/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      brand: {
        DEFAULT: '#146B45',
        600: '#10593A',
        700: '#0C452D',
        50: '#EBF4EF',
        100: '#D5E8DD',
        200: '#ACD0BB',
      },
      accent: {
        DEFAULT: '#2ED47A',
        50: '#E6FAEF',
        700: '#16904F',
      },
      canvas: '#F7F6F2',
      surface: '#FFFFFF',
      sunken: '#F1EFE9',
      ink: {
        DEFAULT: '#1B1F1E',
        2: '#5B6461',
        3: '#8A928F',
      },
      line: {
        DEFAULT: '#E4E2DC',
        strong: '#CFCBC1',
      },
      amber: {
        DEFAULT: '#C98A12',
        50: '#FBF3E1',
      },
      danger: {
        DEFAULT: '#C2412D',
        50: '#FBECE8',
      },
      steel: {
        DEFAULT: '#3B6E8F',
        50: '#EAF1F6',
      },
      star: '#E0A21B',
      night: '#14201B',
    },
    fontFamily: {
      sans: ['"IBM Plex Sans"', '"Noto Sans"', 'system-ui', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
    },
    borderRadius: {
      none: '0',
      sm: '4px',
      DEFAULT: '6px',
      md: '6px',
      lg: '8px',
      full: '9999px',
    },
    extend: {
      fontSize: {
        '2xs': ['11px', '14px'],
        xs: ['12px', '16px'],
        '13': ['13px', '18px'],
      },
      boxShadow: {
        pop: '0 10px 28px -8px rgba(20, 32, 27, 0.22), 0 2px 6px rgba(20, 32, 27, 0.06)',
        drawer: '-12px 0 32px -12px rgba(20, 32, 27, 0.25)',
        card: '0 1px 0 rgba(20, 32, 27, 0.04)',
      },
      keyframes: {
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        flash: {
          '0%': { backgroundColor: 'rgba(46, 212, 122, 0.35)' },
          '100%': { backgroundColor: 'rgba(46, 212, 122, 0)' },
        },
        'pulse-dot': {
          '0%': { boxShadow: '0 0 0 0 rgba(46, 212, 122, 0.55)' },
          '100%': { boxShadow: '0 0 0 8px rgba(46, 212, 122, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'slide-down': 'slide-down 180ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
        'fade-in': 'fade-in 150ms ease-out',
        flash: 'flash 1600ms ease-out',
        'pulse-dot': 'pulse-dot 1200ms ease-out',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
