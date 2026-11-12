import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import type { PreferenceRowProps } from './types';
import { useAppSettings, vibrateIfEnabled } from '../../state/AppSettingsContext';

const { spacing, border, typography, radii } = theme;

export function PreferenceRow({ label, type, value, onValueChange, onDelete }: PreferenceRowProps) {
  const { colors, settings } = useAppSettings();
  const styles = createStyles(colors.theme);
  const iconName = type === 'ingredient' ? 'nutrition-outline' : 'pricetag-outline';
  const iconColor = type === 'ingredient' ? colors.theme.primary : colors.theme.secondary;

  return (
    <View style={styles.row}>
      <View style={styles.leftContent}>
        <View style={[styles.typeBadge, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.rowActions}>
        <Switch
          value={value}
          trackColor={{
            false: colors.theme.secondaryAccent,
            true: colors.theme.secondary,
          }}
          thumbColor={colors.theme.background}
          onValueChange={(nextValue) => {
            vibrateIfEnabled(settings.vibrations);
            onValueChange(nextValue);
          }}
        />

        <Pressable
          onPress={() => {
            vibrateIfEnabled(settings.vibrations);
            onDelete();
          }}
          style={styles.deleteButton}
          accessibilityLabel={`Delete ${label}`}
        >
          <Ionicons name="trash-outline" size={20} color={colors.theme.alert} />
        </Pressable>
      </View>
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
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      marginRight: spacing.sm,
    },
    typeBadge: {
      width: 28,
      height: 28,
      borderRadius: radii.medium,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    label: {
      color: colors.text,
      fontSize: typography.fontSizes.medium,
      fontFamily: typography.fonts.body,
      flexShrink: 1,
    },
    deleteButton: {
      padding: spacing.xs,
      borderRadius: radii.small,
    },
  });
