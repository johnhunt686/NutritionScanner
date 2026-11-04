import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '../../theme';
import { useThemeColors } from '../../state/AppSettingsContext';

const { border, spacing, radii } = theme;

type PanelProps = ViewProps & {
  children: React.ReactNode;
};

export function Panel({ children, style, ...props }: PanelProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors.theme);

  return (
    <View {...props} style={[styles.panel, style]}>
      {children}
    </View>
  );
}

const createStyles = (colors: import('../../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    panel: {
      backgroundColor: colors.content,
      borderRadius: radii.medium,
      borderWidth: border.thin,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.lg,
      overflow: 'hidden',
    },
  });
