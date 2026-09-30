import React from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { NavButton } from '@/components/ui/NavButton';
import { theme } from '../theme';

const { semanticColors, radii, spacing, typography } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" />

      <NavButton
        label="Pref"
        style={styles.prefButton}
        onPress={() => navigation.navigate('Preferences')}
      />

      <NavButton
        label="Look"
        style={styles.lookupButton}
        onPress={() => navigation.navigate('Lookup')}
      />

      <NavButton
        label="Confirm"
        style={styles.resultButton}
        onPress={() => navigation.navigate('ScanConfirmation')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: spacing.md,
    color: semanticColors.theme.text,
    fontFamily: typography.fonts.body,
  },
  camera: {
    flex: 1,
  },
  permissionButton: {
    backgroundColor: semanticColors.theme.primary,
    padding: spacing.sm,
    borderRadius: radii.medium,
    alignSelf: 'center',
  },
  permissionText: {
    color: semanticColors.theme.background,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },

  prefButton: {
    bottom: 60,
    right: 30,
  },
  lookupButton: {
    bottom: 130,
    right: 28,
  },
  resultButton: {
    bottom: 200,
    right: 28,
  },
});
