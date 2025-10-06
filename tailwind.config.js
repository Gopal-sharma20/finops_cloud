/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Financial specific colors
        financial: {
          profit: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            600: '#16a34a',
            900: '#14532d'
          },
          loss: {
            50: '#fef2f2',
            100: '#fee2e2',
            500: '#ef4444',
            600: '#dc2626',
            900: '#7f1d1d'
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            500: '#f59e0b',
            600: '#d97706',
            900: '#78350f'
          }
        },
        // Cloud provider colors
        provider: {
          aws: '#FF9900',
          azure: '#0078D4',
          gcp: '#4285F4',
          multicloud: '#6366F1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        financial: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'financial-xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'financial-sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'financial-base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.025em' }],
        'metric-lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        'metric-xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        'metric-2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.025em' }],
        'metric-3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '0.025em' }],
        'hero-4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '0.025em' }]
      },
      boxShadow: {
        'metric': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
        'chart': '0 4px 12px 0 rgb(0 0 0 / 0.1)',
        'financial': '0 8px 25px -5px rgb(0 0 0 / 0.1), 0 20px 40px -15px rgb(0 0 0 / 0.15)'
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-financial": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.7)" },
          "70%": { boxShadow: "0 0 0 10px rgba(34, 197, 94, 0)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-financial": "pulse-financial 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}