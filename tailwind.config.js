/** @type {import('tailwindcss').Config} */
import { tokens } from './src/styles/tokens'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff9e6',
          100: '#ffedb3',
          200: '#ffe180',
          300: '#ffd54d',
          400: '#ffc91a',
          500: '#e6b000',
          600: '#b38900',
          700: '#806200',
          800: '#4d3b00',
          900: '#1a1400',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        neutral: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          1000: '#000000',
        },
        historical: {
          qin: '#8B4513',
          han: '#DC143C',
          tang: '#FFD700',
          song: '#4682B4',
          ming: '#006400',
          qing: '#4B0082',
        },
      },
      fontFamily: {
        primary: ['"Noto Serif SC"', '"Songti SC"', 'serif'],
        secondary: ['"Noto Sans SC"', '"PingFang SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(255, 200, 100, 0.5)',
        'glow-lg': '0 0 40px rgba(255, 200, 100, 0.6)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(255, 200, 100, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 200, 100, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
