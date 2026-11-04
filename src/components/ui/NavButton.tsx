import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { useAppSettings, vibrateIfEnabled } from '../../state/AppSettingsContext';

const { radii, spacing, typography } = theme;

export interface NavButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const NavButton: React.FC<NavButtonProps> = ({ label, onPress, style }) => {
  const { colors, settings } = useAppSettings();
  const styles = createStyles(colors.theme);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => {
        vibrateIfEnabled(settings.vibrations);
        onPress();
      }}
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: import('../../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    button: {
      position: 'absolute',
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: radii.full,
      zIndex: 1,
    },
    text: {
      color: colors.background,
      fontFamily: typography.fonts.heading,
      fontWeight: typography.fontWeights.bold,
    },
  });
