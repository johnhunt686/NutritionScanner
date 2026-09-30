import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';

const { semanticColors, spacing, border, typography } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'IngredientDetailed'>;

export default function IngredientDetailed({ route }: Props) {
  const { name, description } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <Text style={styles.body}>Placeholder category</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Uses</Text>
        <Text style={styles.body}>Placeholder information about common uses.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <Text style={styles.body}>Placeholder information about this ingredient.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  name: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  description: {
    marginTop: spacing.sm,
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
  },
  section: {
    paddingVertical: spacing.md,
    borderBottomWidth: border.thin,
    borderBottomColor: semanticColors.theme.border,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  body: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
  },
});
