import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppNavigator } from './navigation/AppNavigator';
import {
  useFonts,
  JosefinSans_400Regular,
  JosefinSans_700Bold,
} from '@expo-google-fonts/josefin-sans';
import SyncModal from './screens/SyncModal';
import { db } from '../db/client';
import { AppSettingsProvider, useAppSettings } from './state/AppSettingsContext';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  //declare database to force initialize
  db;
  const [fontsLoaded] = useFonts({
    JosefinRegular: JosefinSans_400Regular,
    JosefinBold: JosefinSans_700Bold,
  });

  if (!fontsLoaded) {
    return null; //maybe screen that looks like loading or smth
  }

  return (
    <AppSettingsProvider>
      <AppContent />
    </AppSettingsProvider>
  );
}

function AppContent() {
  const { colors, settings, isReady } = useAppSettings();

  if (!isReady) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.theme.background }]}>
      <StatusBar style={settings.darkMode ? 'light' : 'dark'} />
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
