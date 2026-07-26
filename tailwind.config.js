/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0b0f',
          soft: '#12121a',
          card: '#16161f',
          hover: '#1c1c27',
        },
        line: '#26262f',
        ink: {
          DEFAULT: '#f4f4f6',
          soft: '#b4b4c0',
          faint: '#71717f',
        },
        brand: {
          DEFAULT: '#e63b3b',
          soft: '#f26d6d',
          dim: '#a82a2a',
        },
        ok: '#4cc79a',
        warn: '#d9a84a',
        bad: '#dd7676',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
    // Fully square: every `rounded-*` in the app resolves to a hard 0px edge.
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
  },
  plugins: [],
}
