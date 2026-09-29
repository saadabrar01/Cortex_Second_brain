/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#04060F',
        panel: '#0A0D1A',
        ink: {
          DEFAULT: '#EDEFF7',
          muted: '#8E93A8',
          faint: '#565B72',
        },
        violet: {
          DEFAULT: '#8B7CF6',
          soft: '#B3A6FF',
          dim: '#4C4290',
        },
        azure: {
          DEFAULT: '#4F8CFF',
          soft: '#8FB6FF',
          dim: '#2A4A8A',
        },
        amber: {
          DEFAULT: '#F0B65C',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'aurora': 'radial-gradient(circle at 15% 20%, rgba(139,124,246,0.16), transparent 45%), radial-gradient(circle at 85% 0%, rgba(79,140,255,0.14), transparent 50%), radial-gradient(circle at 50% 100%, rgba(139,124,246,0.08), transparent 60%)',
        'glow-line': 'linear-gradient(90deg, transparent, rgba(139,124,246,0.6), rgba(79,140,255,0.6), transparent)',
      },
      boxShadow: {
        'glow-violet': '0 0 0 1px rgba(139,124,246,0.25), 0 8px 30px -8px rgba(139,124,246,0.35)',
        'glow-azure': '0 0 0 1px rgba(79,140,255,0.25), 0 8px 30px -8px rgba(79,140,255,0.35)',
        'glow-soft': '0 8px 40px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-14px,0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.55 },
          '50%': { opacity: 1 },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        drift: 'drift 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3.2s ease-in-out infinite',
        rise: 'rise 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
