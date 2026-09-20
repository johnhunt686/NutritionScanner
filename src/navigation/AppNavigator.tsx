import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import Preferences from '../screens/Preferences';
import Lookup from '../screens/Lookup';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
        <Stack.Screen name="Preferences" component={Preferences} />
        <Stack.Screen name="Lookup" component={Lookup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
