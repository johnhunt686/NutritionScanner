import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'IngredientDetailed'>;

export default function IngredientDetailed({ route }: Props) {
  const { name, description } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <Text>Placeholder category</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Uses</Text>
        <Text>Placeholder information about common uses.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <Text>Placeholder information about this ingredient.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 8,
    fontSize: 16,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionTitle: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
