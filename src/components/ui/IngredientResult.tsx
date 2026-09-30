import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';

const { semanticColors, spacing, border, typography } = theme;

export interface IngredientResultProps {
  name: string;
  description: string;
  onPress: () => void;
}

export const IngredientResult: React.FC<IngredientResultProps> = ({
  name,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    borderBottomWidth: border.thin,
    borderBottomColor: semanticColors.theme.border,
  },
  name: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  description: {
    marginTop: spacing.xs,
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.small,
    fontFamily: typography.fonts.body,
  },
});
