import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppNavigator } from './navigation/AppNavigator';
import {
  useFonts,
  JosefinSans_400Regular,
  JosefinSans_700Bold,
} from '@expo-google-fonts/josefin-sans';
import SyncModal from './screens/SyncModal';
import { theme } from './theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    JosefinRegular: JosefinSans_400Regular,
    JosefinBold: JosefinSans_700Bold,
  });

  if (!fontsLoaded) {
    return null; //maybe screen that looks like loading or smth
  }

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
    backgroundColor: theme.semanticColors.theme.background,
  },
});
