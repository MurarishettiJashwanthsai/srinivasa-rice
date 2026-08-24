import { Platform } from 'react-native';

export const colors = {
  background: '#F7F5EF',
  backgroundDeep: '#EEE9DC',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2EA',
  surfaceWarm: '#FFF8E8',
  text: '#15231A',
  textMuted: '#68756C',
  primary: '#D9A441',
  primaryLight: '#F3D58C',
  primaryDark: '#9C6815',
  secondary: '#102A1D',
  secondarySoft: '#1D3B2A',
  success: '#247A4B',
  successSoft: '#E8F5EC',
  danger: '#B33A32',
  dangerSoft: '#FFF0EF',
  info: '#315F7D',
  border: '#DDE4DA',
  borderStrong: '#C7D1C5',
  white: '#FFFFFF',
  black: '#07100B',
  overlay: 'rgba(7, 22, 13, 0.70)',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const shadows = {
  soft: Platform.select({
    ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 18 },
    android: { elevation: 2 },
    default: {},
  }),
  raised: Platform.select({
    ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.13, shadowRadius: 24 },
    android: { elevation: 6 },
    default: {},
  }),
} as const;
