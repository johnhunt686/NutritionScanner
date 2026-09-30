import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Fuse from 'fuse.js';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { IngredientResult } from '@/components/ui/IngredientResult';

type Props = NativeStackScreenProps<RootStackParamList, 'Lookup'>;

export default function Lookup({ navigation }: Props) {
  const [search, setSearch] = useState('');

  const exampleResults = [
    {
      id: 1,
      name: 'The Spink',
      description: 'Haha you cant click this for more information yet.',
    },
    {
      id: 2,
      name: 'Second Example Result',
      description: 'Im the second Example result.',
    },
    {
      id: 3,
      name: 'Red 50',
      description: 'Pen is fald off.',
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
    paddingHorizontal: 16,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 12,
    fontSize: 16,
  },
});
