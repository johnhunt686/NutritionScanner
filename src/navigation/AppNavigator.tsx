import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import Preferences from '../screens/Preferences';
import Lookup from '../screens/Lookup';
import ScanConfirmation from '../screens/ScanConfirmation';
import ScanResult from '../screens/ScanResult';
import IngredientDetailed from '../screens/IngredientDetailed';
import { AppHeader } from '../components/ui/AppHeader';
import { theme } from '../theme';

const { semanticColors } = theme;

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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.offWhite },
          header: ({ navigation, options, route }) => (
            <AppHeader title={options.title ?? route.name} onBack={() => navigation.goBack()} />
          ),
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: semanticColors.theme.background },
          }}
        />
        <Stack.Screen name="Preferences" component={Preferences} />
        <Stack.Screen name="Lookup" component={Lookup} />
        <Stack.Screen name="ScanConfirmation" component={ScanConfirmation} />
        <Stack.Screen name="ScanResult" component={ScanResult} />
        <Stack.Screen
          name="IngredientDetailed"
          component={IngredientDetailed}
          options={{ title: 'Ingredient Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
