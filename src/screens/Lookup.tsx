import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Lookup() {
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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search...  (Basically does NOTHING rn)"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView>
        {exampleResults.map((result) => (
          <View key={result.id} style={styles.result}>
            <Text style={styles.resultName}>{result.name}</Text>
            <Text style={styles.resultDescription}>{result.description}</Text>
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
