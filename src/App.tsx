import React from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import {
  useFonts,
  JosefinSans_400Regular,
  JosefinSans_700Bold,
} from '@expo-google-fonts/josefin-sans';

export default function App() {
  const [fontsLoaded] = useFonts({
    JosefinRegular: JosefinSans_400Regular,
    JosefinBold: JosefinSans_700Bold,
  });

  if (!fontsLoaded) {
    return null; //maybe screen that looks like loading or smth
  }
  return <AppNavigator />;
}
