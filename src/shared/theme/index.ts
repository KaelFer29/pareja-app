export const colors = {
  primary: '#E75480',
  primaryText: '#FFFFFF',
  background: '#FFF7F9',
  surface: '#FFFFFF',
  text: '#2B2B2B',
  textMuted: '#7A7A7A',
  border: '#F0D5DE',
  danger: '#D93F3F',
  overlay: 'rgba(0, 0, 0, 0.35)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
} as const;

export const typography = {
  display: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 64,
  },
  emoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
  },
} as const;
