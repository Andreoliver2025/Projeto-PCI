import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de Cores do ProjetoPCI
        primary: {
          DEFAULT: '#1E2A78',
          50: '#EEF0FA',
          100: '#D4D9F0',
          500: '#1E2A78',
          600: '#161F5A',
          700: '#0E153C',
        },
        secondary: {
          DEFAULT: '#E5E7EB',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          500: '#9CA3AF',
          600: '#6B7280',
          700: '#4B5563',
        },
        accent: {
          DEFAULT: '#12B76A',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#12B76A',
          600: '#0E9656',
          700: '#0A7543',
        },
        error: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        background: '#FFFFFF',
        backgroundDark: '#111827',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Hierarquia Tipográfica
        h1: ['32px', { lineHeight: '1.5', fontWeight: '600' }],
        h2: ['24px', { lineHeight: '1.5', fontWeight: '500' }],
        h3: ['20px', { lineHeight: '1.5', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['13px', { lineHeight: '1.5', fontWeight: '300' }],
      },
      spacing: {
        // 8pt system
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'scale-in': 'scaleIn 200ms ease-in-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config
