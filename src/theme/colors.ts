export const palette = {
  blue500: '#0066FF',
  gray100: '#F3F4F6',
  gray800: '#1F2937',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const semanticColors = {
  light: {
    background: palette.white,
    text: palette.gray800,
    primary: palette.blue500,
    border: palette.gray100,
  },
  dark: {
    background: palette.gray800,
    text: palette.white,
    primary: palette.blue500,
    border: palette.gray800,
  },
} as const;
