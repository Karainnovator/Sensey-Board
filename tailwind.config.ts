import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sakura Pink - Primary brand color (warm, approachable)
        sakura: {
          50: '#FFF5F7',
          100: '#FFEEF2',
          200: '#FFD4E0',
          300: '#FFB7C5', // Main brand color
          400: '#FF9AAE',
          500: '#FF7D97',
          600: '#FF6080',
          700: '#E54D6D',
          800: '#CC3A5A',
          900: '#B22747',
        },
        // Neutral - Sophisticated grays
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Base colors (shadcn)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          light: 'hsl(var(--primary-light))',
          medium: 'hsl(var(--primary-medium))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
          background: 'hsl(var(--card-background))',
        },
        // Semantic colors
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
          foreground: '#FFFFFF',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          foreground: '#FFFFFF',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          light: '#EDE9FE',
        },
        // Ticket type colors
        ticket: {
          issue: 'hsl(var(--ticket-issue))',
          fix: 'hsl(var(--ticket-fix))',
          hotfix: 'hsl(var(--ticket-hotfix))',
          problem: 'hsl(var(--ticket-problem))',
        },
        // Kanban column colors
        column: {
          todo: 'hsl(var(--column-todo))',
          'in-progress': 'hsl(var(--column-in-progress))',
          'in-review': 'hsl(var(--column-in-review))',
          done: 'hsl(var(--column-done))',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
      },
      transitionDuration: {
        micro: '150ms',
        standard: '200ms',
        complex: '300ms',
        page: '400ms',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'modal-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        'modal-in': 'modal-in 0.2s ease-out',
        'slide-down': 'slide-down 0.15s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        DEFAULT:
          '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        dialog: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        card: '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(255, 183, 197, 0.1)',
        'card-hover': '0 12px 24px -8px rgba(0, 0, 0, 0.12)',
        'sakura-glow': '0 8px 20px rgba(255, 183, 197, 0.4)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['12px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '22px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['18px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')],
};

export default config;
