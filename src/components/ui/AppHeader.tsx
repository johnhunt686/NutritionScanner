import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useAppSettings, vibrateIfEnabled } from '../../state/AppSettingsContext';

const { radii, spacing, typography } = theme;

interface AppHeaderProps {
  title: string;
  onBack: () => void;
}

export function AppHeader({ title, onBack }: AppHeaderProps) {
  const { colors, settings } = useAppSettings();
  const styles = createStyles(colors.theme);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.side, styles.backButton]}
          onPress={() => {
            vibrateIfEnabled(settings.vibrations);
            onBack();
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={colors.theme.primaryAccent} />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.side} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: import('../../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.content,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
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
      backgroundColor: colors.surface,
      borderRadius: radii.full,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: colors.text,
      fontFamily: typography.fonts.heading,
      fontSize: typography.fontSizes.xlarge,
      fontWeight: typography.fontWeights.bold,
      letterSpacing: typography.letterSpacing.wide,
    },
  });
