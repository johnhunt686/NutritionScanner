import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';

const { semanticColors, radii, spacing, typography } = theme;

type AppButtonProps = {
  label: string;
  onPress?: () => void;
};

export function AppButton({ label, onPress }: AppButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: semanticColors.theme.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  label: {
    color: semanticColors.theme.background,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
});
