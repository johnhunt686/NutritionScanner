import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import type { PreferenceRowProps } from './types';

const { semanticColors, spacing, border, typography, radii } = theme;

export function PreferenceRow({ label, type, value, onValueChange, onDelete }: PreferenceRowProps) {
  const iconName = type === 'ingredient' ? 'nutrition-outline' : 'pricetag-outline';
  const iconColor =
    type === 'ingredient' ? semanticColors.theme.primary : semanticColors.theme.secondary;

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
          onValueChange={onValueChange}
          trackColor={{
            false: semanticColors.theme.secondaryAccent,
            true: semanticColors.theme.secondary,
          }}
          thumbColor={semanticColors.theme.background}
        />

        <Pressable
          onPress={onDelete}
          style={styles.deleteButton}
          accessibilityLabel={`Delete ${label}`}
        >
          <Ionicons name="trash-outline" size={20} color={semanticColors.theme.alert} />
        </Pressable>
      </View>
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
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
    flexShrink: 1,
  },
  deleteButton: {
    padding: spacing.xs,
    borderRadius: radii.small,
  },
});
