import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export interface IngredientResultProps {
  name: string;
  description: string;
  onPress: () => void;
}

export const IngredientResult: React.FC<IngredientResultProps> = ({
  name,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 4,
    fontSize: 14,
  },
});
