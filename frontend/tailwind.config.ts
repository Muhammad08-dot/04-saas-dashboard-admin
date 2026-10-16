import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#F4F6F8',  // main bg
          100: '#EDF0F3',
          200: '#DDE2E8', // borders
          300: '#C4CBD5',
          400: '#8E99A8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',  // dark bg panels
          900: '#0F172A',  // dark bg main
        },
        indigo: {
          DEFAULT: '#4F46E5',
          dark: '#4338CA',
          light: '#EEF2FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
