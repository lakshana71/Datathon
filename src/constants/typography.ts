// CrimeSphere AI — Typography Tokens

export const FontFamily = {
  display: 'Spectral_600SemiBold',
  displayBold: 'Spectral_700Bold',
  displayMedium: 'Spectral_500Medium',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  bodySemiBold: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
} as const;

export const FontSize = {
  xs: 10,
  sm: 11,
  smPlus: 11.5,
  base: 12,
  basePlus: 12.5,
  md: 13,
  mdPlus: 13.5,
  lg: 14,
  lgPlus: 15,
  xl: 15.5,
  '2xl': 16,
  '3xl': 19,
  '4xl': 26,
  display: 30,
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
  notebook: 34,
} as const;

export const LetterSpacing = {
  tight: 0.2,
  normal: 0.4,
  wide: 0.5,
  wider: 1,
  widest: 1.5,
} as const;
