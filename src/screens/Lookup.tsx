import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { IngredientResult } from '@/components/ui/IngredientResult';
import { theme } from '../theme';
import { useDatabase } from '../../db/useDatabase';

type Result = {
  id: number;
  name: string;
  description: string;
};

const { semanticColors, radii, spacing, border, typography } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'Lookup'>;

export default function Lookup({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

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
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor={semanticColors.theme.primaryAccent}
        value={search}
        onChangeText={setSearch}
      />

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
    backgroundColor: theme.colors.offWhite,
  },
  searchBar: {
    backgroundColor: theme.colors.offWhite,
    borderWidth: border.thin,
    borderColor: semanticColors.theme.border,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginVertical: spacing.md,
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
  },
});
