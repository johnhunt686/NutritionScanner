import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../../theme';

const { semanticColors, border, spacing, typography } = theme;

type SettingsToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SettingsToggleRow({
  label,
  value,
  onValueChange,
  disabled = false,
}: SettingsToggleRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: semanticColors.theme.secondaryAccent,
          true: semanticColors.theme.secondary,
        }}
        thumbColor={semanticColors.theme.background}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: border.thin,
    borderBottomColor: semanticColors.theme.border,
    minHeight: 56,
  },
  label: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.large,
    fontFamily: typography.fonts.body,
    flex: 1,
    marginRight: spacing.md,
    fontWeight: typography.fontWeights.medium,
  },
});
