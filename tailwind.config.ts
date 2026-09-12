import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#001f3f',
        secondary: '#1f2937',
        surface: '#f8f9fb',
        'on-surface': '#1f2937',
        'surface-variant': '#e5e7eb',
        'on-surface-variant': '#4b5563',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container-highest': '#e5e7eb',
        outline: '#d1d5db',
        'outline-variant': '#e5e7eb',
        success: '#16a34a',
        error: '#ef4444',
        green: {
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;