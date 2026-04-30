/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="mission-control"], [data-theme="monochrome-pro"], [data-theme="aurora"]'],
  theme: {
    extend: {
      colors: {
        // Mission Control Theme
        mc: {
          bg: '#080c14',
          card: 'rgba(15, 23, 42, 0.6)',
          border: 'rgba(148, 163, 184, 0.12)',
          accent: '#3b82f6',
          accentGlow: 'rgba(59, 130, 246, 0.4)',
          success: '#22c55e',
          successGlow: 'rgba(34, 197, 94, 0.4)',
          warning: '#eab308',
          warningGlow: 'rgba(234, 179, 8, 0.4)',
          danger: '#ef4444',
          dangerGlow: 'rgba(239, 68, 68, 0.4)',
          text: '#f1f5f9',
          textMuted: '#94a3b8',
        },
        // Monochrome Pro Theme
        mp: {
          bg: '#000000',
          card: '#0a0a0a',
          border: 'rgba(255, 255, 255, 0.1)',
          accent: '#6366f1',
          text: '#ffffff',
          textMuted: '#71717a',
        },
        // Aurora Theme
        aurora: {
          bgStart: '#0a0f1e',
          bgEnd: '#0f172a',
          card: 'rgba(15, 23, 42, 0.85)',
          border: 'rgba(148, 163, 184, 0.15)',
          accent: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          text: '#f8fafc',
          textMuted: '#94a3b8',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      animation: {
        'pulse-halo': 'pulse-halo 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ring': 'radar-ring 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'mesh-gradient': 'mesh-gradient 15s ease infinite',
        'slide-right': 'slide-right 150ms ease-out forwards',
      },
      keyframes: {
        'pulse-halo': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.5)' },
        },
        'radar-ring': {
          '0%': { transform: 'scale(0.5)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'mesh-gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(2px)' },
        }
      },
      backdropBlur: {
        'card': '12px',
        'header': '16px',
        'sidebar': '20px',
      },
      boxShadow: {
        'glow-blue': '0 0 24px rgba(59, 130, 246, 0.25)',
        'glow-green': '0 0 24px rgba(34, 197, 94, 0.25)',
        'glow-yellow': '0 0 24px rgba(234, 179, 8, 0.25)',
        'glow-red': '0 0 24px rgba(239, 68, 68, 0.25)',
      }
    },
  },
  plugins: [
    function ({ addBase, addUtilities, theme }) {
      addBase({
        '[data-theme="mission-control"]': {
          backgroundColor: theme('colors.mc.bg'),
          color: theme('colors.mc.text'),
        },
        '[data-theme="monochrome-pro"]': {
          backgroundColor: theme('colors.mp.bg'),
          color: theme('colors.mp.text'),
        },
        '[data-theme="aurora"]': {
          background: `linear-gradient(135deg, ${theme('colors.aurora.bgStart')} 0%, ${theme('colors.aurora.bgEnd')} 100%)`,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          color: theme('colors.aurora.text'),
        },
      });

      addUtilities({
        '.glass-card': {
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: '0.75rem',
        },
        '.status-halo': {
          position: 'relative',
        },
        '.status-halo::after': {
          content: '""',
          position: 'absolute',
          inset: '-6px',
          borderRadius: '50%',
          opacity: '0.4',
          animation: 'pulse-halo 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
      });
    }
  ],
}