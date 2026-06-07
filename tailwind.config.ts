import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        surface: {
          0: 'hsl(0 0% 100%)',
          1: 'hsl(0 0% 98%)',
          2: 'hsl(0 0% 96%)',
          3: 'hsl(0 0% 93%)',
        },
        ink: {
          DEFAULT: 'hsl(0 0% 9%)',
          secondary: 'hsl(0 0% 45%)',
          tertiary: 'hsl(0 0% 65%)',
        },
        accent: {
          DEFAULT: 'hsl(240 100% 60%)',
          subtle: 'hsl(240 100% 97%)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200px 0' },
          to: { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
