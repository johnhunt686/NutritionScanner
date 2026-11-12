import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { useThemeColors } from '../../state/AppSettingsContext';

const { spacing, typography } = theme;

type SettingsHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SettingsHeader({ title, subtitle }: SettingsHeaderProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors.theme);

  return (
    <View style={styles.headerWrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const createStyles = (colors: import('../../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    headerWrap: {
      marginBottom: spacing.md,
    },
    title: {
      color: colors.text,
      fontSize: typography.fontSizes.display,
      fontFamily: typography.fonts.heading,
      fontWeight: typography.fontWeights.bold,
    },
    subtitle: {
      color: colors.text,
      fontSize: typography.fontSizes.small,
      fontFamily: typography.fonts.body,
      opacity: 0.7,
      marginTop: spacing.xs,
    },
  });
