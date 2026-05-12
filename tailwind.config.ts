import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        agro: {
          bg: '#1e1e2f',
          bg2: '#222233',
          surface: '#27293d',
          surface2: '#2d2f45',
          green: '#34d399',
          green2: '#10b981',
          teal: '#2dd4bf',
          blue: '#3b82f6',
          amber: '#f59e0b',
          red: '#ef4444',
          text: '#f8fafc',
          text2: '#94a3b8',
        },
      },
      boxShadow: {
        glow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        xl2: '20px',
      },
    },
  },
  plugins: [],
} satisfies Config;