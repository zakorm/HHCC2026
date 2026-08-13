/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#1F3A5F',
        'ink-soft': '#3A5A80',
        accent: '#4A78A5',
        'accent-soft': '#DCE9F5',
        sage: '#5C8A72',
        'sage-soft': '#E1EEE6',
        coral: '#D8542E',
        'coral-soft': '#FBE4DB',
        bg: '#EFF4F9',
        card: '#FFFFFF',
        line: '#E1E7EE',
        muted: '#6B7785',
      },
      fontFamily: {
        display: ['Fraunces_500Medium'],
        'display-semibold': ['Fraunces_600SemiBold'],
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
        'body-bold': ['Inter_700Bold'],
        mono: ['IBMPlexMono_500Medium'],
      },
      fontSize: {
        eyebrow: '10px',
        'page-title': '20px',
        wordmark: '26px',
        'card-title': '14.5px',
        body: '12px',
        small: '10px',
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
