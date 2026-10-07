import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '../../theme';

const { semanticColors, border, spacing, radii } = theme;

type PanelProps = ViewProps & {
  children: React.ReactNode;
};

export function Panel({ children, style, ...props }: PanelProps) {
  return (
    <View {...props} style={[styles.panel, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: semanticColors.theme.content,
    borderRadius: radii.medium,
    borderWidth: border.thin,
    borderColor: semanticColors.theme.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
});
