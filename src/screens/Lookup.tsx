import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Fuse from 'fuse.js';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { IngredientResult } from '@/components/ui/IngredientResult';
import { theme } from '../theme';

const { semanticColors, radii, spacing, border, typography } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'Lookup'>;

export default function Lookup({ navigation }: Props) {
  const [search, setSearch] = useState('');

  const exampleResults = [
    {
      id: 1,
      name: 'Example Ingredient 1',
      description: 'Example Ingredient 1 description.',
    },
    {
      id: 2,
      name: 'Example Ingredient 2',
      description: 'Example Ingredient  2 description.',
    },
    {
      id: 3,
      name: 'Example Ingredient 3',
      description: 'Example Ingredient 3 description.',
    },
  ];

  const fuse = new Fuse(exampleResults, {
    keys: ['name', 'description'],
    threshold: 0.4,
  });

  const filteredResults =
    search.trim() === '' ? exampleResults : fuse.search(search).map((result) => result.item);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor={semanticColors.theme.primaryAccent}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView>
        {filteredResults.map((result) => (
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
  searchBar: {
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
