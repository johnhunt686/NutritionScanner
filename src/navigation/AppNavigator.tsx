import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import Preferences from '../screens/Preferences';
import Lookup from '../screens/Lookup';
import ScanConfirmation from '../screens/ScanConfirmation';
import ScanResult from '../screens/ScanResult';
import IngredientDetailed from '../screens/IngredientDetailed';
import Settings from '../screens/Settings';
import { theme } from '../theme';

const { semanticColors, typography } = theme;

export type RootStackParamList = {
  Home: undefined;
  Preferences: undefined;
  Lookup: undefined;
  ScanConfirmation: { scannedText: string } | undefined;
  ScanResult: { scannedText: string };
  IngredientDetailed: {
    name: string;
    description: string;
  };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: semanticColors.theme.background },
          headerStyle: { backgroundColor: semanticColors.theme.content },
          headerTintColor: semanticColors.theme.text,
          headerTitleStyle: {
            color: semanticColors.theme.text,
            fontFamily: typography.fonts.heading,
            fontWeight: typography.fontWeights.bold,
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Preferences" component={Preferences} />
        <Stack.Screen name="Lookup" component={Lookup} />
        <Stack.Screen name="ScanConfirmation" component={ScanConfirmation} />
        <Stack.Screen name="ScanResult" component={ScanResult} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen
          name="IngredientDetailed"
          component={IngredientDetailed}
          options={{ title: 'Ingredient Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
