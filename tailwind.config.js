/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'dark-green': '#1B1B15',
        'bright-green': '#1CF86E',
        'font-white': '#F7F8FA',
        'font-gray': '#9CA3AF',
        'side-window-green': 'rgba(40, 40, 33, 0.75)',
        'session-goals-green': 'rgba(40, 40, 33, 1.0)',
        'macdonalds-shit': {
          DEFAULT: 'rgba(102, 124, 88, 1)',
          bright: 'rgba(102, 124, 88, 0.7)'
        }
      },
      height: {
        '1/20': '5%',
        '2/30': '6.66%',
        '1/10': '10%',
        '8/10': '80%'
      }
    }
  }
}
