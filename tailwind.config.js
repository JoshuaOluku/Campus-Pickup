/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'campus-blue': '#123B5D',
        'deep-blue': '#0B2740',
        'electric-orange': '#FF6B35',
        'warm-orange': '#FFF0E8',
        'fresh-green': '#1F9D55',
        'amber-warn': '#D88A00',
        'error-red': '#C9362B',
        'off-white': '#F8FAFC',
        'surface': '#FFFFFF',
        'ink': '#17212B',
        'slate-muted': '#667085',
        'soft-slate': '#D9E1E8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
}