import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';
import { useAppSettings, vibrateIfEnabled } from '../../state/AppSettingsContext';

const { radii, spacing, typography } = theme;

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function AppButton({ label, onPress, disabled = false }: AppButtonProps) {
  const { colors, settings } = useAppSettings();
  const styles = createStyles(colors.theme);

  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled]}
      onPress={() => {
        if (disabled) return;
        vibrateIfEnabled(settings.vibrations);
        onPress?.();
      }}
      disabled={disabled}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: import('../../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      borderRadius: radii.medium,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
    },
    label: {
      color: colors.background,
      fontSize: typography.fontSizes.medium,
      fontFamily: typography.fonts.heading,
      fontWeight: typography.fontWeights.bold,
    },
    disabled: {
      opacity: 0.5,
    },
  });
