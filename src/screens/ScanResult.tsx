import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { IngredientResult, type IngredientResultTag } from '@/components/ui/IngredientResult';
import { theme } from '../theme';
import { useDatabase } from '../../db/useDatabase';

const { semanticColors, spacing, border, typography, radii } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'ScanResult'>;
type Result = {
  id: number;
  name: string;
  description: string;
  tags: IngredientResultTag[];
  matched: boolean;
};

export default function ScanResult({ route, navigation }: Props) {
  const scannedText = route.params?.scannedText;
  const { searchIngredientsByName, getIngredientProfile } = useDatabase();

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

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
                description: 'Not found in the database',
                tags: [],
                matched: false,
              };
            }

            const profile = await getIngredientProfile(ingredient.id);

            return {
              id: ingredient.id,
              name: ingredient.commonName ?? ingredient.formalName,
              description: profile?.descriptions[0]?.descriptionShort ?? 'No Description',
              tags: profile?.tags ?? [],
              matched: true,
            };
          }),
        );

        setResults(databaseResults);
      } catch (error) {
        console.error('Failed to load from database', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    void loadResults();
  }, [scannedText, searchIngredientsByName, getIngredientProfile]);

  const matchedCount = results.filter((result) => result.matched).length;
  const unmatchedCount = results.length - matchedCount;

  return (
    <View style={styles.container}>
      <View style={styles.scanPanel}>
        <View style={styles.scanPanelHeader}>
          <View style={styles.scanIcon}>
            <Ionicons name="scan-outline" size={18} color={semanticColors.theme.secondary} />
          </View>
          <Text style={styles.scanPanelTitle}>Scanned text</Text>
        </View>
        <Text style={styles.scannedText} numberOfLines={4}>
          {scannedText || 'No text was captured.'}
        </Text>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Results</Text>
        {!loading && results.length > 0 && (
          <Text style={styles.resultsSummary}>
            {matchedCount} matched
            {unmatchedCount > 0 ? ` · ${unmatchedCount} not found` : ''}
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator color={semanticColors.theme.primary} />
          <Text style={styles.stateText}>Matching ingredients...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centeredState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="scan-outline" size={28} color={semanticColors.theme.primary} />
          </View>
          <Text style={styles.emptyTitle}>No ingredients detected</Text>
          <Text style={styles.stateText}>Try scanning the ingredient list again.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.resultsList}>
          {results.map((result) => (
            <IngredientResult
              key={result.id}
              name={result.name}
              description={result.description}
              tags={result.tags}
              status={result.matched ? 'matched' : 'unmatched'}
              onPress={
                result.matched
                  ? () =>
                      navigation.navigate('IngredientDetailed', {
                        ingredientId: result.id,
                      })
                  : undefined
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
    backgroundColor: theme.colors.offWhite,
  },
  scanPanel: {
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: semanticColors.theme.content,
    borderWidth: border.thin,
    borderColor: `${semanticColors.theme.primary}35`,
    borderRadius: radii.large,
  },
  scanPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  scanIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.offWhite,
    borderRadius: radii.full,
  },
  scanPanelTitle: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  scannedText: {
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.xsmall,
    fontFamily: typography.fonts.mono,
    lineHeight: typography.fontSizes.xsmall * typography.lineHeights.normal,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  resultsTitle: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.large,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  resultsSummary: {
    flexShrink: 1,
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.small,
    fontFamily: typography.fonts.body,
    textAlign: 'right',
  },
  resultsList: {
    paddingBottom: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: semanticColors.theme.content,
    borderRadius: radii.full,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.large,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  stateText: {
    marginTop: spacing.sm,
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.small,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
  },
});
