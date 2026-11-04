export const palette = {
  green100: '#007022',
  green200: '#00948d',
  green150: '#164223',
  green250: '#164e4b',
  yellow: '#f1ae1e',
  red: '#cc3f14',
  white: '#e4ffd2',
  offWhite: '#f1fff0',
  black: '#0d1400',
  brightGreen: '#d3f9c9',
} as const;

export const semanticColors = {
  theme: {
    background: palette.white,
    surface: palette.offWhite,
    content: palette.brightGreen,
    text: palette.black,
    primary: palette.green100,
    secondary: palette.green200,
    primaryAccent: palette.green150,
    secondaryAccent: palette.green250,
    border: palette.black,
    overlay: 'rgba(13, 20, 0, 0.55)',
    alert: palette.red,
    notice: palette.yellow,
  },
} as const;

export const darkSemanticColors = {
  theme: {
    background: '#101810',
    surface: '#101810',
    content: '#1c291d',
    text: '#f1fff0',
    primary: '#65d47a',
    secondary: '#58c8c0',
    primaryAccent: '#b4d3b7',
    secondaryAccent: '#376147',
    border: '#57715b',
    overlay: 'rgba(0, 0, 0, 0.7)',
    alert: '#ff806b',
    notice: '#ffd166',
  },
} as const;

export type SemanticThemeColors = {
  [Key in keyof typeof semanticColors.theme]: string;
};
