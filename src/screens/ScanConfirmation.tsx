import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScanConfirmation({ route, navigation }: any) {
  const scannedText = route.params?.scannedText ?? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel arcu commodo, tincidunt tellus ut, volutpat ex. Nam et massa ullamcorper, bibendum tortor eu, egestas massa';

  const confirmScan = () => {
    navigation.navigate('ScanResult', {
      scannedText: scannedText,
    });
  };

  const retryScan = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Does this look right?</Text>

      <View style={styles.result}>
        <Text style={styles.scannedText}>{scannedText}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={confirmScan}>
        <Text style={styles.buttonText}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={retryScan}>
        <Text style={styles.buttonText}>No</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },

  result: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 16,
  },

  scannedText: {
    fontSize: 16,
  },

  button: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});