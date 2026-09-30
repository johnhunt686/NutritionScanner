import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../../theme';

const { semanticColors, radii, spacing, typography } = theme;

export interface NavButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const NavButton: React.FC<NavButtonProps> = ({ label, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    backgroundColor: semanticColors.theme.primary,
    padding: spacing.md,
    borderRadius: radii.full,
    zIndex: 1,
  },
  text: {
    color: semanticColors.theme.background,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
});
