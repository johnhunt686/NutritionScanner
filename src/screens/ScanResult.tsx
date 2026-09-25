import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanResult'>;

export default function ScanResult({ route }: Props) {
  const scannedText = route.params?.scannedText;

  const exampleResults = [
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
  ];

  return (
    <View style={styles.container}>
      
      <View style={styles.scannedTextPlaceholder}>
        <Text style={styles.scannedText}>{scannedText}</Text>
      </View>

      <Text style={styles.resultsTitle}>Results</Text>

      <ScrollView>
        {exampleResults.map((result) => (
          <View key={result.id} style={styles.result}>
            <Text style={styles.resultName}>{result.name}</Text>

            <Text style={styles.resultDescription}>
              {result.description}
            </Text>
          </View>
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