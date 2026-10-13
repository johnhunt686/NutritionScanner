import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { IngredientResult, type IngredientResultTag } from '@/components/ui/IngredientResult';
import { theme } from '../theme';
import { useDatabase } from '../../db/useDatabase';

type Result = {
  id: number;
  name: string;
  description: string;
  tags: IngredientResultTag[];
};

const { semanticColors, radii, spacing, border, typography } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'Lookup'>;

export default function Lookup({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const { searchIngredientsByName, getIngredientProfile, getAllIngredients } = useDatabase();

  useEffect(() => {
    async function loadResults() {
      setLoading(true);

      try {
        const ingredients =
          search.trim() === '' ? await getAllIngredients() : await searchIngredientsByName(search);
        const databaseResults = await Promise.all(
          ingredients.map(async (ingredient) => {
            const profile = await getIngredientProfile(ingredient.id);

            return {
              id: ingredient.id,
              name: ingredient.commonName ?? ingredient.formalName,
              description: profile?.descriptions[0]?.descriptionShort ?? 'No Description found',
              tags: profile?.tags ?? [],
            };
          }),
        );
        setResults(databaseResults);
      } catch (error) {
        console.error('Failed to load results:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [search, searchIngredientsByName, getIngredientProfile, getAllIngredients]);

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={semanticColors.theme.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ingredients"
            placeholderTextColor={semanticColors.theme.primaryAccent}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            accessibilityLabel="Search ingredients"
          />
          {search.length > 0 && (
            <Pressable
              style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
              onPress={() => setSearch('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color={semanticColors.theme.primaryAccent} />
            </Pressable>
          )}
        </View>

        {!loading && results.length > 0 && (
          <Text style={styles.resultCount}>
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator color={semanticColors.theme.primary} />
          <Text style={styles.stateText}>Loading ingredients...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centeredState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search-outline" size={28} color={semanticColors.theme.primary} />
          </View>
          <Text style={styles.emptyTitle}>No ingredients found</Text>
          <Text style={styles.stateText}>
            {search.trim()
              ? 'Try another name or a broader search.'
              : 'No ingredients are available yet.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.resultsList} keyboardShouldPersistTaps="handled">
          {results.map((result) => (
            <IngredientResult
              key={result.id}
              name={result.name}
              description={result.description}
              tags={result.tags}
              onPress={() =>
                navigation.navigate('IngredientDetailed', {
                  ingredientId: result.id,
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
    backgroundColor: theme.colors.offWhite,
  },
  searchSection: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: semanticColors.theme.content,
    borderWidth: border.thin,
    borderColor: `${semanticColors.theme.primary}35`,
    borderRadius: radii.large,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
  },
  clearButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.offWhite,
    borderRadius: radii.full,
  },
  clearButtonPressed: {
    opacity: 0.65,
  },
  resultCount: {
    marginTop: spacing.sm,
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.small,
    fontFamily: typography.fonts.body,
  },
  resultsList: {
    paddingTop: spacing.sm,
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
