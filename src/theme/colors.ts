export const palette = {
  green100: '#007022',
  green200: '#00948d',
  green150: '#164223',
  green250: '#164e4b',
  yellow: '#f1ae1e',
  red: '#cc3f14',
  white: '#e4ffd2',
  offWhite: '#cffdc9',
  black: '#0d1400',
} as const;

export const semanticColors = {
  theme: {
    background: palette.white,
    content: palette.offWhite,
    text: palette.black,
    primary: palette.green100,
    secondary: palette.green200,
    primaryAccent: palette.green150,
    secondaryAccent: palette.green250,
    border: palette.black,
    alert: palette.red,
    notice: palette.yellow,
  },
} as const;
