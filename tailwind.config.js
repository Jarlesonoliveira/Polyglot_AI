/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.7)'
          },
          '50%': {
            opacity: '.8',
            boxShadow: '0 0 0 15px rgba(99, 102, 241, 0)'
          },
        }
      }
    },
  },
  plugins: [],
}
