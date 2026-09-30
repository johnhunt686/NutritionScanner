import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useDatabase } from '../../db/useDatabase';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanResult'>;
type Result = {
  id: number;
  name: string;
  description: string;
};


export default function ScanResult({ route }: Props) {
  const scannedText = route.params?.scannedText;
  const { searchIngredientsByName, getIngredientProfile } = useDatabase();

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadResults() {
      const segments = (scannedText ?? '')
        .split(',')
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
      
      setLoading(true);

      try {
        const databaseResults = await Promise.all(
          segments.map(async (segment, index) => {
            const matches = await searchIngredientsByName(segment);
            const ingredient = matches[0];

            if (!ingredient)
            {
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
              description:
                profile?.descriptions[0]?.descriptionShort ?? 'No Description',
            };
          }),
        );

        setResults(databaseResults);        
      } catch (error){
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
  /*const results = (scannedText ?? '')
    .split(',')
    .map((segment, index) => ({
      id: index + 1,
      name: segment.trim(),
      description: 'Placeholder description.',
    }))
    .filter((result) => result.name.length > 0);*/

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

  scannedTextPlaceholder: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  scannedText: {
    fontSize: 12,
  },

  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
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
