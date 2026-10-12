export const colors = {
  background: '#FFFAF7',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F0EB',
  primary: '#D0668A',
  primaryPressed: '#B9557A',
  primarySoft: '#FBE9EF',
  primaryText: '#FFFFFF',
  accent: '#7A5242',
  accentSoft: '#F2E7E0',
  text: '#3A2A23',
  textMuted: '#937E73',
  border: '#EFE4DD',
  danger: '#C2453D',
  dangerSoft: '#FBEAE8',
  shadow: '#5C3D2E',
  overlay: 'rgba(58, 42, 35, 0.45)',
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  floating: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;

export const typography = {
  display: {
    fontFamily: fonts.extrabold,
    fontSize: 52,
    lineHeight: 60,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 28,
    lineHeight: 36,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 19,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
  },
  bodyStrong: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 23,
  },
  caption: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  emoji: {
    fontSize: 26,
    lineHeight: 32,
  },
} as const;
