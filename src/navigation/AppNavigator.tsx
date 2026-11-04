import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import Preferences from '../screens/Preferences';
import Lookup from '../screens/Lookup';
import ScanConfirmation from '../screens/ScanConfirmation';
import ScanResult from '../screens/ScanResult';
import IngredientDetailed from '../screens/IngredientDetailed';
import Sources from '../screens/Sources';
import Settings from '../screens/Settings';
import { AppHeader } from '../components/ui/AppHeader';
import { useAppSettings } from '../state/AppSettingsContext';

export type RootStackParamList = {
  Home: undefined;
  Preferences: undefined;
  Lookup: undefined;
  ScanConfirmation: { scannedText: string } | undefined;
  ScanResult: { scannedText: string };
  IngredientDetailed: {
    ingredientId: number;
  };
  Settings: undefined;
  Sources: { ingredientId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { colors, settings } = useAppSettings();
  const navigationTheme = settings.darkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.theme.surface,
          card: colors.theme.content,
          text: colors.theme.text,
          primary: colors.theme.primary,
          border: colors.theme.border,
          notification: colors.theme.alert,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.theme.surface,
          card: colors.theme.content,
          text: colors.theme.text,
          primary: colors.theme.primary,
          border: colors.theme.border,
          notification: colors.theme.alert,
        },
      };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: colors.theme.surface },
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
            contentStyle: { backgroundColor: colors.theme.background },
          }}
        />
        <Stack.Screen name="Preferences" component={Preferences} />
        <Stack.Screen name="Lookup" component={Lookup} />
        <Stack.Screen name="ScanConfirmation" component={ScanConfirmation} />
        <Stack.Screen name="ScanResult" component={ScanResult} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Sources" component={Sources} options={{ title: 'Sources' }} />
        <Stack.Screen
          name="IngredientDetailed"
          component={IngredientDetailed}
          options={{ title: 'Ingredient Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
