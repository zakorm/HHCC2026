/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#161616',
        'ink-soft': '#3A3A3A',
        green: '#4CAF50',
        'green-dark': '#2E7D32',
        'green-soft': '#E9F6EA',
        orange: '#F2994A',
        'orange-soft': '#FDEEDF',
        process: '#8B95A1',
        'process-soft': '#EEF1F3',
        'neutral-bar': '#C7CCC7',
        bg: '#FFFFFF',
        card: '#FFFFFF',
        line: '#E7ECE7',
        muted: '#6B7280',
      },
      fontFamily: {
        display: ['Poppins_700Bold'],
        'display-semibold': ['Poppins_600SemiBold'],
        'display-medium': ['Poppins_500Medium'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        'body-bold': ['Inter_700Bold'],
      },
      fontSize: {
        eyebrow: '10.5px',
        'page-title': '22px',
        wordmark: '26px',
        'card-title': '15.5px',
        body: '13px',
        small: '11px',
      },
      borderRadius: {
        sm: '9px',
        md: '14px',
        lg: '16px',
        pill: '9999px',
      },
      spacing: {
        '4.5': '18px',
      },
    },
  },
  plugins: [],
};
