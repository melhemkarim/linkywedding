import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: 'var(--gold)',
        goldsoft: 'var(--gold-soft)',
        ivory: 'var(--ivory)',
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
      },
    },
  },
  plugins: [],
};

export default config;
