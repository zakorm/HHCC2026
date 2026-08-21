// Jstyoucation design tokens — v2, matches the rebrand in Hackathon_Deck_v2.pdf
// (green/black/orange, Poppins headlines). Mirrored in tailwind.config.js theme.
// Kept here for props that take raw color values instead of className
// (e.g. lucide-react-native icons take a `color` prop, not a style).
// Source of truth for content: design/tokens.js (Claude Design mockup output).

export const colors = {
  green: '#4CAF50', // brand color + "strong" mastery indicator
  greenDark: '#2E7D32', // green text-on-light-bg (better contrast than base green)
  greenSoft: '#E9F6EA', // green backgrounds (upload zone, icon chips, strong-area card)
  orange: '#F2994A', // "needs support" indicator, priority chips
  orangeSoft: '#FDEEDF',
  ink: '#161616', // primary text, headers, nav bar, dark callout bg
  inkSoft: '#3A3A3A', // secondary headings
  muted: '#6B7280', // secondary/help text
  process: '#8B95A1', // neutral "processing" status (not brand-colored)
  processSoft: '#EEF1F3',
  bg: '#FFFFFF', // screen background
  card: '#FFFFFF',
  line: '#E7ECE7', // borders/dividers
  neutralBar: '#C7CCC7', // progress bar fill for "not enough data" topics
};

export const fonts = {
  display: 'Poppins_700Bold', // screen titles, logo, card headlines
  displaySemibold: 'Poppins_600SemiBold',
  displayMedium: 'Poppins_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  // mono removed in v2 — no monospace elements in the updated brand deck
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
