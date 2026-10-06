import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
//import Fuse from 'fuse.js';
import { useDatabase } from '../../db/useDatabase';

type Result = {
  id: number;
  name: string;
  description: string;
};

export default function Lookup() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    searchIngredientsByName,
    getIngredientProfile,
    getAllIngredients,
  } = useDatabase();

  useEffect(() => {
    async function loadResults() {
      setLoading(true);

      try {
        const ingredients = search.trim() === '' ? await getAllIngredients() : await searchIngredientsByName(search);
        const databaseResults = await Promise.all(ingredients.map(async (ingredient) => {
          const profile = await getIngredientProfile(ingredient.id);

          return {
            id: ingredient.id,
            name: ingredient.commonName ?? ingredient.formalName,
            description: profile?.descriptions[0]?.descriptionShort ?? 'No Description found',
          };
        }),);
        setResults(databaseResults);
      } catch (error) 
      {
        console.error('Failed to load results:', error);     
        setResults([]);   
      } finally
      {
        setLoading(false);
      }
    }
    loadResults();
  }, [
    search,
    searchIngredientsByName,
    getIngredientProfile,
    getAllIngredients,
  ]);

  /*const exampleResults = [
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
    search.trim() === '' ? exampleResults : fuse.search(search).map((result) => result.item); */

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <Text>Loading results...</Text>
      ) : (
        <ScrollView>
          {results.map((result) => (
            <View key={result.id} style={styles.result}>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={styles.resultDescription}>
                {result.description}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
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
  result: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultDescription: {
    marginTop: 4,
    fontSize: 14,
  },
});
