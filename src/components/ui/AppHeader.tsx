import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

const { semanticColors, radii, spacing, typography } = theme;

interface AppHeaderProps {
  title: string;
  onBack: () => void;
}

export function AppHeader({ title, onBack }: AppHeaderProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.side, styles.backButton]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={semanticColors.theme.primaryAccent} />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.side} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.theme.content,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(22, 66, 35, 0.18)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  side: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(241, 255, 240, 0.6)',
    borderRadius: radii.full,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: semanticColors.theme.text,
    fontFamily: typography.fonts.heading,
    fontSize: typography.fontSizes.xlarge,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
});
