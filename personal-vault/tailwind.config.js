/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vault-bg': '#0B0B0D',
        'vault-card': '#111113',
        'vault-border': '#1c1c1e',
        'vault-border2': '#2a2a2c',
        'vault-input': '#0D0D0F',
        'vault-hover': '#161618',
        'vault-accent': '#43234A',
        'vault-accent-hover': '#5e2c65',
        'vault-cyan': '#00E0FF',
      },
    },
  },
  plugins: [],
}