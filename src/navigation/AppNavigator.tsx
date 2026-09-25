import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import Preferences from '../screens/Preferences';
import Lookup from '../screens/Lookup';
import ScanConfirmation from '../screens/ScanConfirmation'
import ScanResult from '../screens/ScanResult'

export type RootStackParamList = {
  Home: undefined;
  Preferences: undefined;
  Lookup: undefined;
  ScanConfirmation: | {scannedText: string} | undefined;
  ScanResult: {scannedText: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Preferences" component={Preferences} />
        <Stack.Screen name="Lookup" component={Lookup} />
        <Stack.Screen name="ScanConfirmation" component={ScanConfirmation} />
        <Stack.Screen name="ScanResult" component={ScanResult} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
