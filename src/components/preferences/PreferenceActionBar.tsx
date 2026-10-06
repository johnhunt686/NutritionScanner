import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '../ui/AppButton';
import { theme } from '../../theme';

const { spacing } = theme;

type PreferenceActionBarProps = {
  onAddIngredient: () => void;
  onAddTag: () => void;
};

export function PreferenceActionBar({ onAddIngredient, onAddTag }: PreferenceActionBarProps) {
  return (
    <View style={styles.actionRow}>
      <AppButton label="Add Ingredient" onPress={onAddIngredient} />
      <AppButton label="Add Tag" onPress={onAddTag} />
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
});
