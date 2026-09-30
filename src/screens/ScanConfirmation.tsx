import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';

const { semanticColors, spacing, border, typography } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'ScanConfirmation'>;

export default function ScanConfirmation({ route, navigation }: Props) {
  const scannedText =
    route.params?.scannedText ??
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel arcu commodo, tincidunt tellus ut, volutpat ex. Nam et massa ullamcorper, bibendum tortor eu, egestas massa';

  const confirmScan = () => {
    navigation.navigate('ScanResult', {
      scannedText: scannedText,
    });
  };

  const retryScan = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Does this look right?</Text>

      <View style={styles.result}>
        <Text style={styles.scannedText}>{scannedText}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={confirmScan}>
        <Text style={styles.buttonText}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={retryScan}>
        <Text style={styles.buttonText}>No</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  title: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.xlarge,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
    marginVertical: spacing.md,
  },

  result: {
    paddingVertical: spacing.md,
    borderBottomWidth: border.thin,
    borderBottomColor: semanticColors.theme.border,
    borderTopWidth: border.thin,
    borderTopColor: semanticColors.theme.border,
    marginBottom: spacing.md,
  },

  scannedText: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
  },

  button: {
    paddingVertical: spacing.md,
    borderBottomWidth: border.thin,
    borderBottomColor: semanticColors.theme.border,
  },

  buttonText: {
    color: semanticColors.theme.primary,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
});
