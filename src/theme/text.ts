// src/theme/text.ts

export const typography = {
  fonts: {
    // Replace these with your exact custom font names once loaded via expo-font.
    // 'Avenir' is built into iOS and is highly geometric.
    heading: 'JosefinBold',
    body: 'JosefinRegular',
    mono: 'monospace',
  },
  fontSizes: {
    xsmall: 12,
    small: 14,
    medium: 16, // Standard body text
    large: 18,
    xlarge: 20,
    display: 24,
  },
  fontWeights: {
    light: '400',
    medium: '500',
    bold: '700',
  } as const, // `as const` ensures TS knows these are valid React Native font weights
  lineHeights: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    // Bauhaus style often benefits from slight negative tracking on large headings
    tighter: -1,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Export individual variables so you can import them directly if needed
export const { fonts, fontSizes, fontWeights, lineHeights, letterSpacing } = typography;
