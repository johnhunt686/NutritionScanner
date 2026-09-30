import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { IngredientResult } from '@/components/ui/IngredientResult';
import { theme } from '../theme';
import { useDatabase } from '../../db/useDatabase';

const { semanticColors, spacing, border, typography } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'ScanResult'>;
type Result = {
  id: number;
  name: string;
  description: string;
};

export default function ScanResult({ route, navigation }: Props) {
  const scannedText = route.params?.scannedText;
  const { searchIngredientsByName, getIngredientProfile } = useDatabase();

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadResults() {
      const segments = (scannedText ?? '')
        .replace(/^ingredients:\s*/i, '')
        .split(',')
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);

      setLoading(true);

      try {
        const databaseResults = await Promise.all(
          segments.map(async (segment, index) => {
            const matches = await searchIngredientsByName(segment);
            const ingredient = matches[0];

            if (!ingredient) {
              return {
                id: -(index + 1),
                name: segment,
                description: 'No Match',
              };
            }

            const profile = await getIngredientProfile(ingredient.id);

            return {
              id: ingredient.id,
              name: ingredient.commonName ?? ingredient.formalName,
              description: profile?.descriptions[0]?.descriptionShort ?? 'No Description',
            };
          }),
        );

        setResults(databaseResults);
      } catch (error) {
        console.error('Failled to load from database', error);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [scannedText, searchIngredientsByName, getIngredientProfile]);

  /* const exampleResults = [
    {
      id: 1,
      name: 'Example Ingredient 1',
      description: 'Example Ingredient 1 description.',
    },
    {
      id: 2,
      name: 'Example Ingredient 2',
      description: 'Example Ingredient 2 description.',
    },
    {
      id: 3,
      name: 'Example Ingredient 3',
      description: 'Example Ingredient 3 description.',
    },
  ];*/

  return (
    <View style={styles.container}>
      <View style={styles.scannedTextPlaceholder}>
        <Text style={styles.scannedText}>{scannedText}</Text>
      </View>

      <Text style={styles.resultsTitle}>Results</Text>

      {loading ? (
        <Text>Loading results...</Text>
      ) : (
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
      )}
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
