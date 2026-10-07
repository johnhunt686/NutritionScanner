import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

const { semanticColors, spacing, typography } = theme;

type SettingsHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SettingsHeader({ title, subtitle }: SettingsHeaderProps) {
  return (
    <View style={styles.headerWrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    marginBottom: spacing.md,
  },
  title: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  subtitle: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.small,
    fontFamily: typography.fonts.body,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
});
