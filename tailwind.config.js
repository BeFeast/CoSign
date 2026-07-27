/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces step up from the page ground so cards read as separate.
        bg: {
          DEFAULT: '#08080a', // page ground
          card: '#0a0a0c', // primary card
          soft: '#101014', // raised / inset
          hover: '#17171d', // hover / tile
        },
        line: {
          DEFAULT: '#26262e', // border
          soft: '#1d1d24', // subtle divider
        },
        ink: {
          DEFAULT: '#f4f4f6',
          soft: '#a3a3ae',
          faint: '#6b6b78',
          dim: '#4a4a55',
        },
        brand: {
          DEFAULT: '#e63b3b',
          soft: '#f26d6d',
          dim: '#a82a2a',
        },
        // Split-bar greys: agreed shares and the fainter unconfirmed fills.
        split: {
          agreed: '#55555f',
          mid: '#3a3a42',
          low: '#2a2a31',
        },
        ok: '#4cc79a',
        warn: '#d9a84a',
        bad: '#dd7676',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        // Numbers everywhere use Plex Mono so percentages align.
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
    // Interactive elements get a subtle 4px (rounded-sm); containers stay square.
    borderRadius: {
      none: '0px',
      sm: '4px',
      DEFAULT: '4px',
      md: '4px',
      lg: '4px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '9999px',
    },
  },
  plugins: [],
}
