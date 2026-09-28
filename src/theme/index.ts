import { palette, semanticColors } from './colors';
import { radii } from './radii';
import { spacing } from './spacing';

export const theme = {
  colors: palette,
  semanticColors,
  radii,
  spacing,
  borderWidths: {
    hairline: 0.5,
    thin: 1,
    medium: 2,
    thick: 4,
  },
} as const;

export type Theme = typeof theme;
