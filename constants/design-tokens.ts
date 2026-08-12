// Jstyoucation design tokens — derived from the Claude Design mockup.
// Font family strings match the keys expo-google-fonts exposes after loading
// (see app/_layout.tsx for the useFonts() setup).

export const colors = {
  ink: '#1F3A5F', // primary text, headers, nav bar
  inkSoft: '#3A5A80', // secondary headings
  accent: '#4A78A5', // links, icons, processing states
  accentSoft: '#DCE9F5', // accent backgrounds (upload zone, icon chips)
  sage: '#5C8A72', // "strong" mastery indicator
  sageSoft: '#E1EEE6',
  coral: '#D8542E', // "needs work" mastery indicator, alerts
  coralSoft: '#FBE4DB',
  bg: '#EFF4F9', // screen background
  card: '#FFFFFF',
  line: '#E1E7EE', // borders/dividers
  muted: '#6B7785', // secondary/help text
};

export const fonts = {
  display: 'Fraunces_500Medium', // screen titles, profile name, card titles
  displaySemibold: 'Fraunces_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  mono: 'IBMPlexMono_500Medium', // eyebrows, small data labels
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
};

export const radii = {
  sm: 9,
  md: 14,
  lg: 16,
  pill: 999,
};

export const typeScale = {
  eyebrow: 10.5,
  pageTitle: 22,
  cardTitle: 15.5,
  body: 13,
  small: 11,
};
