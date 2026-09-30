import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { IngredientResult } from '@/components/ui/IngredientResult';
import { theme } from '../theme';

const { semanticColors, spacing, border, typography } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'ScanResult'>;

export default function ScanResult({ route, navigation }: Props) {
  const scannedText = route.params?.scannedText;

  /* const exampleResults = [
    {
      id: 1,
      name: 'Asspertaain',
      description: 'Still Cant Click',
    },
    {
      id: 2,
      name: 'Second Example Result',
      description: 'This probably looks very familiar.',
    },
    {
      id: 3,
      name: 'Red 57',
      description: 'Pen is fald off still.',
    },
  ];*/
  const results = (scannedText ?? '')
    .split(',')
    .map((segment, index) => ({
      id: index + 1,
      name: segment.trim(),
      description: 'Placeholder description.',
    }))
    .filter((result) => result.name.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.scannedTextPlaceholder}>
        <Text style={styles.scannedText}>{scannedText}</Text>
      </View>

      <Text style={styles.resultsTitle}>Results</Text>

      <ScrollView>
        {results.map((result) => (
          <IngredientResult
            key={result.id}
            name={result.name}
            description={result.description}
            onPress={() =>
              navigation.navigate('IngredientDetailed', {
                name: result.name,
                description: result.description,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  scannedTextPlaceholder: {
    paddingVertical: spacing.md,
    borderBottomWidth: border.thin,
    borderBottomColor: semanticColors.theme.border,
  },

  scannedText: {
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.xsmall,
    fontFamily: typography.fonts.mono,
  },

  resultsTitle: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.large,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
