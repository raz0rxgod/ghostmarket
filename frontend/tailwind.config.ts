import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#07070a',
          soft: '#0c0c12',
          surface: '#121218',
          raised: '#191922',
        },
        line: 'rgba(255,255,255,0.08)',
        ghost: {
          violet: '#8b5cf6',
          fuchsia: '#d946ef',
          cyan: '#22d3ee',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'ghost-gradient':
          'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #22d3ee 100%)',
        'ghost-gradient-soft':
          'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(217,70,239,0.14) 50%, rgba(34,211,238,0.12) 100%)',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(139,92,246,0.45)',
        'glow-sm': '0 0 20px -8px rgba(139,92,246,0.5)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-18px) translateX(10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        'float-slow': 'float 14s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
