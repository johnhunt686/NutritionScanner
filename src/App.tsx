import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppNavigator } from './navigation/AppNavigator';
import SyncModal from './screens/SyncModal';

export default function App() {
  return (
    <View style={styles.container}>
      <AppNavigator />
      <SyncModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
