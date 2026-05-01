import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Fig Mint Palette ── */
        'fig-cream': '#F9F7F2',        // Warm light background
        'fig-black': '#1A1A1A',        // Primary text / UI
        'fig-red': '#D32F2F',          // Machine Intelligence accent
        'saffron': '#FF9933',          // Law & Order alerts ONLY
        'fig-warm': '#F0EDE6',         // Subtle warm surface
        'fig-border': '#E8E4DB',       // Warm border color

        /* ── Legacy tokens (for ballot/registration compatibility) ── */
        'paper-beige': '#F0EDE6',
        'paper-beige-dark': '#E5E1D5',
        'ink-black': '#1A1A1A',
        'stamp-red': '#D32F2F',
        'oxford-blue': '#1A1A1A',      // Remapped to black for legacy refs
        'oxford-blue-deep': '#111111',
        'cream': '#F9F7F2',            // Remapped to fig-cream
        'alert-red': '#D32F2F',
      },
      fontFamily: {
        'instrument-serif': ['"Instrument Serif"', 'Georgia', 'serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'courier-prime': ['"Courier Prime"', '"Courier New"', 'Courier', 'monospace'],
        'geist-mono': ['"Geist Mono"', '"Courier Prime"', 'monospace'],
        /* Legacy alias */
        'jetbrains-mono': ['"Courier Prime"', '"Courier New"', 'monospace'],
      },
      keyframes: {
        'stagger-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'scan-line': {
          '0%': { top: '-2px' },
          '100%': { top: '100%' },
        },
        'scan-button': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'typing-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'ink-splash': {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '50%': { transform: 'scale(1.3)', opacity: '0.4' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        'ticket-tear': {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '40%': { transform: 'translateX(8px) rotate(1deg)', opacity: '1' },
          '100%': { transform: 'translateX(60px) rotate(3deg)', opacity: '0' },
        },
        'stamp-press': {
          '0%': { transform: 'scale(2.5) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(0.9) rotate(-12deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-12deg)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'data-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'stagger-fade-in': 'stagger-fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scan-line': 'scan-line 3s linear infinite',
        'scan-button': 'scan-button 1.5s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'typing-cursor': 'typing-cursor 1s step-end infinite',
        'ink-splash': 'ink-splash 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ticket-tear': 'ticket-tear 0.5s ease-in forwards',
        'stamp-press': 'stamp-press 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'progress-fill': 'progress-fill 0.8s ease-out forwards',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'data-pulse': 'data-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
