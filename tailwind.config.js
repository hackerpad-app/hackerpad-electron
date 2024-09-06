/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'dark-green': '#1B1B15',
        'bright-green': '#1CF86E'
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
