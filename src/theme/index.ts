import { border } from './border';
import { palette, semanticColors } from './colors';
import { radii } from './radii';
import { spacing } from './spacing';
import { typography } from './text';

export const theme = {
  colors: palette,
  semanticColors,
  radii,
  spacing,
  border,
  typography,
} as const;

export type Theme = typeof theme;
