/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#09090b',
          900: '#0c0c0d',
          800: '#18181b',
          700: '#27272a',
          500: '#71717a',
          300: '#d4d4d8',
          100: '#fafafa'
        },
        accent: {
          lime: '#a3e635',
          cyan: '#22d3ee',
          rose: '#f43f5e',
          amber: '#fbbf24',
          emerald: '#34d399'
        }
      },
      fontFamily: {
        sans: ['System']
      }
    }
  },
  plugins: []
};
