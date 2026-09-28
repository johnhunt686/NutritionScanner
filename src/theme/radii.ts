export const radii = {
  small: 2,
  medium: 5,
  large: 10,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radii;
