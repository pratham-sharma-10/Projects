/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Colors are driven by the CSS custom properties defined in src/index.css
      // (single source of truth for Alia's brand). Editing the hex values there
      // recolors the whole app.
      colors: {
        'alia-bg': 'var(--alia-bg)',
        'alia-surface': 'var(--alia-surface)',
        'alia-surface-2': 'var(--alia-surface-2)',
        'alia-ink': 'var(--alia-ink)',
        'alia-ink-soft': 'var(--alia-ink-soft)',
        'alia-ink-muted': 'var(--alia-ink-muted)',
        'alia-accent': 'var(--alia-accent)',
        'alia-accent-hover': 'var(--alia-accent-hover)',
        'alia-accent-fg': 'var(--alia-accent-fg)',
        'alia-border': 'var(--alia-border)',
        'alia-border-strong': 'var(--alia-border-strong)',
        'alia-pass': 'var(--alia-pass)',
        'alia-pass-bg': 'var(--alia-pass-bg)',
        'alia-warn': 'var(--alia-warn)',
        'alia-warn-bg': 'var(--alia-warn-bg)',
        'alia-fail': 'var(--alia-fail)',
        'alia-fail-bg': 'var(--alia-fail-bg)',
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        alia: '12px',
        'alia-sm': '8px',
      },
      boxShadow: {
        'alia-card': 'var(--alia-shadow-card)',
        'alia-pop': 'var(--alia-shadow-pop)',
      },
      transitionTimingFunction: {
        alia: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
