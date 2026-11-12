import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../../theme';
import { useAppSettings, vibrateIfEnabled } from '../../state/AppSettingsContext';

const { border, spacing, typography } = theme;

type SettingsToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  showDivider?: boolean;
};

export function SettingsToggleRow({
  label,
  value,
  onValueChange,
  disabled = false,
  showDivider = true,
}: SettingsToggleRowProps) {
  const { colors, settings } = useAppSettings();
  const styles = createStyles(colors.theme);

  return (
    <View style={[styles.row, !showDivider && styles.withoutDivider]}>
      <Text style={styles.label}>{label}</Text>

      <Switch
        value={value}
        onValueChange={(nextValue) => {
          vibrateIfEnabled(settings.vibrations);
          onValueChange(nextValue);
        }}
        disabled={disabled}
        trackColor={{
          false: colors.theme.secondaryAccent,
          true: colors.theme.secondary,
        }}
        thumbColor={colors.theme.background}
      />
    </View>
  );
}

const createStyles = (colors: import('../../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: border.thin,
      borderBottomColor: colors.border,
      minHeight: 56,
    },
    withoutDivider: {
      borderBottomWidth: 0,
    },
    label: {
      color: colors.text,
      fontSize: typography.fontSizes.large,
      fontFamily: typography.fonts.body,
      flex: 1,
      marginRight: spacing.md,
      fontWeight: typography.fontWeights.medium,
    },
  });
